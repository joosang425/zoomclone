import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Paper, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
      width:"85%",
      height:"93%",
      marginTop:"20px",
  },
  paper: {
      width:"100%",
      height:"100%", 
      paddingTop:"1%",
      marginTop:"0.5%"
  },
  scriptContainer: {
      backgroundColor:"#f7f6e1", 
      width:"89%", 
      height:"80%",
      padding: "3%",
      borderRadius:10, 
      margin:"auto",
      textAlign: "left",
      overflow:"auto",
      '&::-webkit-scrollbar' : {
          display : 'none'
      },
      boxShadow:"0px 3px 3px -2px rgb(0 0 0 / 20%), 0px 3px 4px 0px rgb(0 0 0 / 14%), 0px 1px 8px 0px rgb(0 0 0 / 12%)",

  },
}));

export default function MeetScript(prop) {
  const classes = useStyles();
  const [list, setList] = useState([]);

  useEffect(() => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type","application/json");

    var raw = JSON.stringify({ "meet_id": prop.meet_id});

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };

    fetch("/meet_chat", requestOptions)
    .then(res => res.json())
    .then(result => {
      setList(result.chat.split(','));
    })
    .catch(error => console.log('error', error))
  }, [prop]);

  return (
    <div className={classes.root}>
      {/* <Paper elevation={3} className={classes.paper}> */}
        <Typography variant="h6" align="center">
          <span style={{fontWeight: "bold", textDecoration: "underline", textDecorationColor: "#99ccff"}}>회의록</span>
        </Typography>
        <br/>
        <div className={classes.scriptContainer}>
          <div style={{height:"100%",overflow:"auto"}}>
          {list && list.map(data => (
            <Typography key={Math.random()}>{data}</Typography>
          ))}
          </div>
        </div>
      {/* </Paper> */}
    </div>
  );
}