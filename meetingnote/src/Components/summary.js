import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Paper, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
      width:"85%",
      height:"50%",
      marginTop:"1%",
      marginLeft:"10%",
  },
  paper: {
      marginLeft:"1%",
      width:"100%",
      height:"100%", 
      paddingTop:"1%",
      marginTop:"3%",
  },
  data: {
      overflow:"auto",
      height:"100%",
      '&::-webkit-scrollbar' : {
          display : 'none'
      },
  },
}));

export default function Script(prop) {
  const classes = useStyles();
  const [data, setData] = useState([]);
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type","application/json");

    var raw = JSON.stringify({"meet_id": prop.meet_id});

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };

    fetch("/meet_info", requestOptions)
    .then(res => res.json())
    .then(result => {
      if(result.code === 31) {
        alert("회의 스크립트가 존재하지 않습니다. 메인 화면으로 이동합니다.");
        window.location.href = '/main';
      }
      else if (result.code === 0) {
        console.log(result);
        setData(result.data.meet_summary.split(','));
        setUserData(result.data.meet_wordcloud);
      }
    })
    .catch(error => console.log('error', error));
  }, [prop]);

  return (
    <div className={classes.root}>
      <Paper elevation={3} className={classes.paper}>
        <Typography variant="h6" align="center">
          <span style={{fontWeight: "bold", textDecoration: "underline overline", textDecorationColor: "#3f51b5"}}>Summary</span>
        </Typography>
        <div style={{backgroundColor: "#eaeaea", width: "84%", height: "60%", borderRadius: 10, margin: "auto", padding: "3%", textAlign: "left"}}>
          <Typography className={classes.data}>
            {data && data.map(element =>(
                <Typography key={Math.random()}>{element}</Typography>
            ))}
          </Typography>
        </div>
      </Paper>
      <Paper elevation={3} className={classes.paper}>
        <Typography variant="h6" align="center">
          <span style={{fontWeight: "bold", textDecoration: "underline overline", textDecorationColor: "#3f51b5"}}>Wordcloud</span>
        </Typography>
        <div style={{backgroundColor: "#eaeaea", width: "84%", height: "70%", borderRadius: 10, margin: "auto", padding: "3%"}}>
          <img src={userData} width="70%" height="100%" id="userData" alt="userdata" />
        </div>
      </Paper>
    </div>
  );
}