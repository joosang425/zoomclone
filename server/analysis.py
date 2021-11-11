import imp
import sys
import io
import redis
import json
import os

import shortuuid
from wordcloud import WordCloud
from collections import Counter

from krwordrank.sentence import summarize_with_sentences
from krwordrank.word import KRWordRank
from kss import split_sentences
from threading import Thread

sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.detach(), encoding='utf-8')

env = os.environ.get("PYTHON_ENV")
tgtdir = ''
if env == 'production': 
    import mecab 
    mecab = mecab.MeCab()
    tgtdir = '../meetingnote/build/uploads/'
    
else:
    from eunjeon import Mecab
    mecab = Mecab()
    tgtdir = '../meetingnote/public/uploads/'
    
def visualize(contents):
    nouns = mecab.nouns(contents)
    count = Counter(nouns)
    
    remove_char_counter = Counter(
        {x: count[x] for x in count if len(x) >= 2})
    
    noun_list = remove_char_counter.most_common(100)
    
    filename = shortuuid.uuid()
    wc = WordCloud(font_path='../NanumSquareR.ttf', 
                   background_color="white",
                   width=1000,
                   height=1000,
                   max_words=100,
                   max_font_size=300)
    
    wc.generate_from_frequencies(dict(noun_list))
    wc.to_file('%s%s.png' % (tgtdir, filename))
    data = '%s%s.png' % ("/uploads/", filename)
    result = {'type': 'wordcloud', 'data': data}
    r.publish('server', json.dumps(result, ensure_ascii=False))
    
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

if env == "produnction":
    r = redis.from_url(os.environ.get("REDIS_URL"))
else:
    r = redis.StrictRedis(host="localhost", port=6379, db=0)
    
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
            sentence = split_sentences(contents)
            
            roomId = data['room']

            th1 = Thread(target=visualize, args=(contents, ))
            th2 = Thread(target=summarize, args=(sentence, ))

            th1.start()
            th2.start()


            th1.join()
            th2.join()

            r.publish('server', json.dumps({"type": "finish", "room": roomId}, ensure_ascii=False))