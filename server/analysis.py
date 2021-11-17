# -*- coding: utf-8 -*- 
import io
from re import split
import kss
import redis
import shortuuid
import json
import sys 
import os

from collections import Counter

#형태소분석기 Mecab

from wordcloud import WordCloud

#KRWordRank
from krwordrank.sentence import summarize_with_sentences
from krwordrank.word import KRWordRank

#graph
import matplotlib.pyplot as plt
from matplotlib import font_manager,rc
import matplotlib.cm as cm #colormap


from threading import Thread

sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding = 'utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.detach(), encoding = 'utf-8')

#matplotlib 한글 font
font_path = '../NanumSquareR.ttf'
font = font_manager.FontProperties(fname=font_path).get_name()
rc('font', family=font)
#matplotlib 한글 font

env = os.environ.get("PYTHON_ENV")
tgtdir = ''
if env == "production":
    import mecab
    mecab = mecab.MeCab()
    tgtdir = 'meetingnote/build/uploads/'

else:
    from konlpy.tag import Mecab
    mecab = Mecab(dicpath=r"C:\mecab\mecab-ko-dic")
    tgtdir = 'meetingnote/public/uploads/'


#wordcloud 시각화
def visualize(content): 
    filename = shortuuid.uuid()
    N  = [] #명사 배열
    pos = mecab.pos(content)

    for word in pos:
        if word[1] in ['NNG','NNP','XR']:
            if len(word[0])>1 : 
                N.append(word[0])
    p1 = WordCloud(font_path='../NanumSquareR.ttf',max_font_size=180,
                background_color='white', width=1200, height=800, colormap=cm.tab20
               ).generate_from_frequencies(dict(Counter(N).most_common(50))) #frequency기준 상위 50개
    p1.to_file('%s%s.png' % (tgtdir, filename))
    data = '%s%s.png' % ("/uploads/", filename)
    result = {'type': 'wordcloud', 'data': data}
    r.publish('server', json.dumps(result, ensure_ascii=False))

#wordcloud 시각화
def summarize(content):
    try:
        penalty = lambda x:0 if (25 <= len(x)) else 1 #길이가 25부터 80글자인 문장 선호
        #diversity = 코사인 유사도 기준 핵심문장간의 최소 거리, 값이 클수록 다양한 문장 선택
        keywords, sents = summarize_with_sentences(content,num_keysents=4,num_keywords=5,penalty=penalty,diversity=0.5,verbose=False)
        key_sents=""
        for i in range(len(sents)):
            key_sents += (sents[i]+", ")
        result = {'type':'summary','data':key_sents}
        r.publish('server',json.dumps(result,ensure_ascii=False))
    except:
        result = {'type':'summary','data':'요약할 대화가 충분하지 않습니다.'}
        r.publish('server',json.dumps(result,ensure_ascii=False))

if env == "production":
    r = redis.from_url(os.environ.get("REDIS_URL"))
else: 
    r = redis.StrictRedis(host='localhost', port=6379, db=0)

sub = r.pubsub()
sub.subscribe('analysis_channel')
while True:
    message = sub.get_message()

    if message:
        data = message['data']
        if not data == 1:
            data = data.decode('utf-8')
            data = json.loads(data)

            contents = data['contents'].replace(","," ")
            sentence = kss.split_sentences(contents)
            
            roomId = data['room']

            th1 = Thread(target=visualize, args=(contents, ))
            th2 = Thread(target=summarize, args=(sentence, ))

            th1.start()
            th2.start()


            th1.join()
            th2.join()

            r.publish('server', json.dumps({"type": "finish", "room": roomId}, ensure_ascii=False))


