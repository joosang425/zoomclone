import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Paper, Typography, InputBase, Button} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
      width:"45%",
      height:"90%",
      margin:"1%"
  },
  inputRoot: {
    color: 'primary',
    width: "75%",
  },
  inputInput: {
    paddingTop: "3%",
    paddingBottom: "3%",
    paddingLeft: "3%",
    width: '100%'
  },
  search: {
    position: 'relative',
    borderRadius: 7,
    backgroundColor: "#ffffff",
    marginTop: "30%",
    marginRight: "1%",
    width: '70%'
  },
  Secsearch: {
    position: 'relative',
    borderRadius: 7,
    backgroundColor: "#ffffff",
    marginTop: "15%",
    marginRight: "1%",
    width: '70%'
  },
  Button: {
    width: "100px",
    marginLeft: "3%",
    backgroundColor:"#72c7fc",
    fontSize:"medium",
    fontWeight:"bold"
  },

}));

export default function Scheduled(prop) {
  const classes = useStyles();
  const [keywords, setKeyWords] = useState('');
  const [meet_name, setMeetName] = useState('');

  const handleEnterMeet = () => {
    var user_id = sessionStorage.getItem("user_id");
    var user_name = sessionStorage.getItem("user_name");

    if(keywords === '') {
      alert("방 ID를 입력해주세요.");
    }
    else {
      var myHeaders = new Headers();
      myHeaders.append("Content-Type","application/json");
  
      var raw = JSON.stringify({ "meet_id": keywords});
  
      var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
      };
  
      fetch("/meet_valid", requestOptions)
      .then(res => res.json())
      .then(result => {
        console.log(result);
        if(result.code === 0) {
          alert("회의에 입장합니다");
          window.open(`/meeting?meet_id=${result.id}&user_id=${user_id}&user_name=${user_name}`, 'Lets MeetingNote');
        }
        else if (result.code === 31) {
          alert("삭제된 회의입니다.");
          window.location.reload();
        }
        else if (result.code === 36) {
          alert("이미 종료된 회의입니다.");
          window.location.reload();
        }
      })
      .catch(error => console.log('error', error))
    }
  };

  const handleSubmit = () => {
    var user_id = sessionStorage.getItem("user_id");
    var user_name = sessionStorage.getItem("user_name");

    if (meet_name === '') {
      alert("회의 방 이름을 입력하세요");
    }
    else {
      var myHeaders = new Headers();
      myHeaders.append("Content-Type","application/json");
  
      var raw = JSON.stringify({ "meet_name": meet_name});
  
      var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
      };
  
      fetch("/meet_create", requestOptions)
      .then(res => res.json())
      .then(result => {
        console.log(result);
        if(result.code === 0) {
          alert("회의에 입장합니다");
          window.open(`/meeting?meet_id=${result.id}&user_id=${user_id}&user_name=${user_name}`, 'Lets MeetingNote');
        }
      })
      .catch(error => console.log('error', error))
    }
  };

  const onKeyPress = (e) => {
    if(e.key === 'Enter') {
      handleEnterMeet();
    }
  }

  return (
    <div className={classes.root}>
        <Paper elevation={3} style={{height:"100%", paddingTop:"1%",boxShadow:"none"}}>
            <Typography variant="h6" align="center">
                <span style={{fontWeight: "bold", textDecoration:"underline", textDecorationColor:"#99ccff"}}>회의방 입장</span>   
            </Typography>
            <div style={{backgroundColor: "#f7f6e1", width: "90%", height: "85%", borderRadius: 10, margin: "3% auto auto",boxShadow:"0px 3px 3px -2px rgb(0 0 0 / 20%), 0px 3px 4px 0px rgb(0 0 0 / 14%), 0px 1px 8px 0px rgb(0 0 0 / 12%)"}}>
              <InputBase className={classes.search}
              placeholder = "회의방 번호를 입력해주세요"
              classes = {{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps = {{'aria-label': 'search'}}
              value = {keywords}
              onChange={({ target: {value}}) => setKeyWords(value)}
              onKeyPress= { onKeyPress }
              />
              <Button className={classes.Button} height="50" variant="contained" color="primary" onClick={handleEnterMeet}>
                참가
              </Button>
              <InputBase className={classes.Secsearch}
              placeholder="회의방 이름을 입력해주세요"
              classes= {{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps = {{'aria-label': 'search'}}
              value={meet_name}
              onChange={({ target: {value}}) => setMeetName(value)}
              onKeyPress={ onKeyPress }
              />
              <Button className={classes.Button} height="50" variant="contained" color="primary" onClick={handleSubmit}>
                만들기
              </Button>
            </div>
        </Paper> 
    </div>
  );
}