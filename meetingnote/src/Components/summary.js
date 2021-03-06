import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Paper, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
      width:"85%",
      height:"100%",
      // marginTop:"20px",
      marginLeft:"10%",
  },
  paper: {
      marginLeft:"1%",
      width:"100%",
      height:"100%", 
      paddingTop:"1%",
      marginTop:"3%",
  },
  // data: {
  //     overflow:"auto",
  //     height:"100%",
  //     '&::-webkit-scrollbar' : {
  //         display : 'none'
  //     },
  // },
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
      {/* <Paper elevation={3} className={classes.paper}> */}
        <Typography variant="h6" align="center">
          <span style={{fontWeight: "bold", textDecoration: "underline", textDecorationColor: "#99ccff"}}>요약본</span>
        </Typography>
        <br/>
        <div style={{backgroundColor: "#f7f6e1", width: "84%", height: "32%", borderRadius: 10, margin: "auto", padding: "3%", textAlign: "left",boxShadow:"0px 3px 3px -2px rgb(0 0 0 / 20%), 0px 3px 4px 0px rgb(0 0 0 / 14%), 0px 1px 8px 0px rgb(0 0 0 / 12%)"}}>
          <div style={{height:"100%",overflowY:"auto"}}>
          {/* <Typography className={classes.data}> */}
            {data && data.map(element =>(
                <Typography key={Math.random()}>{element}</Typography>
            ))}
          {/* </Typography> */}
          </div>
        </div>
      {/* </Paper> */}
      {/* <Paper elevation={3} className={classes.paper}> */}
        <Typography variant="h6" align="center" style={{marginTop:"12px"}}>
          <span style={{fontWeight: "bold", textDecoration: "underline", textDecorationColor: "#99ccff"}}>Wordcloud</span>
        </Typography>
        <br/>
        <div style={{backgroundColor: "#f7f6e1", width: "84%", height: "32%", borderRadius: 10, margin: "auto", padding: "3%",boxShadow:"0px 3px 3px -2px rgb(0 0 0 / 20%), 0px 3px 4px 0px rgb(0 0 0 / 14%), 0px 1px 8px 0px rgb(0 0 0 / 12%)"}}>
          <img src={userData} width="70%" height="100%" id="userData" alt="userdata" />
        </div>
      {/* </Paper> */}
    </div>
  );
}