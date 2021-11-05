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
    borderRadius: 20,
    backgroundColor: "#a9a9a9",
    marginTop: "25%",
    marginRight: "1%",
    width: '70%'
  },
  Secsearch: {
    position: 'relative',
    borderRadius: 20,
    backgroundColor: "#a9a9a9",
    marginTop: "15%",
    marginRight: "1%",
    width: '70%'
  },
  Button: {
    width: "20%",
    marginLeft: "3%"
  },
}));

export default function Scheduled(prop) {
  const classes = useStyles();
  const [keywords, setKeyWords] = useState('');
  const [meet_name, setMeetName] = useState('');

  const handleEnterMeet = () => {
    var meet_id = sessionStorage.getItem("meet_id");
    var user_id = sessionStorage.getItem("user_id");
    var user_name = sessionStorage.getItem("user_name");

    if(keywords === '') {
      alert("방 ID를 입력해주세요.");
    }
    else {
      var myHeaders = new Headers();
      myHeaders.append("Content-Type","application/json");
  
      var raw = JSON.stringify({ "meet_name": keywords});
  
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
          window.open(`/meeting?meet_id=${meet_id}&user_id=${user_id}&user_name=${user_name}`, 'Lets MeetingNote');
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
          window.open(`/meeting?meet_name=${meet_name}&user_id=${user_id}&user_name=${user_name}`, 'Lets MeetingNote');
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
        <Paper elevation={3} style={{height:"100%", paddingTop:"1%"}}>
            <Typography variant="h6" align="center">
                <span style={{fontWeight: "bold", textDecoration:"underline overline", textDecorationColor:"#3f51b5"}}>Scheduled</span>   
            </Typography>
            <div style={{backgroundColor: "#eaeaea", width: "90%", height: "85%", borderRadius: 10, margin: "auto"}}>
              <InputBase className={classes.search}
              placeholder = "Input..."
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
                START
              </Button>
              <InputBase className={classes.Secsearch}
              placeholder="Input..."
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
                CREATE
              </Button>
            </div>
        </Paper> 
    </div>
  );
}