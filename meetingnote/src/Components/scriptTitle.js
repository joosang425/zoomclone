import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Typography, Chip, Grid, Button} from '@material-ui/core';
import EventIcon from '@material-ui/icons/Event';
import LogoutIcon from '@material-ui/icons/LockOpen';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

const useStyles = makeStyles((theme) => ({
  header: {
      minWidth:850,
      backgroundColor: "#72c7fc",
      width: "100%",
      display: "flex",
  },
  leftBtn: {
      width: "94%",
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center"
  },
  headerBtn: {
      marginLeft: "5%"
  },
  root: {
      width:"90%",
      height:"12%",
      margin:"auto"
  },
  Chip: {
      fontSize: 14,
      backgroundColor: "#0065fc",
      marginLeft:"1%",
      height:"10%",
      color:"#ffffff"
  },
  grid: {
      display:"flex",
      justifyContent:"flex-start",
      alignItems:"center",
  },
}));

export default function ScriptTitle(prop) {
  const classes = useStyles();
  const [data, setData] = useState('');

  useEffect(() => {
    if(sessionStorage.getItem("user_id") == null || sessionStorage.getItem("user_id") === "") {
      alert("비정상적인 접근입니다. 로그인 후 이용하세요. \n 로그인 화면으로 이동합니다.");
      window.location.href = '/';
    }

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({ "meet_id": prop.meet_id });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };

    fetch("/meet_info", requestOptions)
    .then(res => res.json())
    .then(result => {
      console.log(result);
      if (result.code === 0) {
        setData(result.data);
      }
      else if (result.code === 37) {
        alert("오류가 발생하였습니다. 메인 화면으로 이동합니다.");
        window.location.href = '/main';
      }
    })
    .catch(error => console.log('error', error))
  },[prop]);

  const handleClickLogout = () => {
    sessionStorage.setItem("user_id",'');
    sessionStorage.setItem("user_name",'');
    alert("로그아웃 되었습니다.");
    window.location.href = '/';
  }

  return (
    <div>
    <div className={classes.header}>
        <Button style={{margin:"1%", width:"6%", minWidth:90, padding:0, backgroundColor:"#0065fc"}} color="primary" variant="contained" href="/main" >
            <ArrowBackIcon/>&nbsp;메인
        </Button>
        <div className={classes.leftBtn}>
          <span style={{color: "#ffffff", fontWeight: "bold", maxWidth: "100%", marginRight:"1%" }}>{sessionStorage.getItem("user_name")}님</span>
            <Button style={{margin:"1%", backgroundColor:"#0065fc", color:"#ffffff"}} onClick={handleClickLogout} color="#72c7fc" variant="contained">
                <LogoutIcon/>&nbsp;로그아웃
            </Button>
            
        </div>
    </div>
      <div className={classes.root}>
        <Grid>
            <Typography variant="h6" align="left" style={{width:"100%", marginTop:"1%"}}>
                <span style={{fontWeight:"bold", marginLeft:"1%"}}>{data.meet_name}</span>
            </Typography>
        </Grid>
        <Grid className={classes.grid}>
            <Chip className={classes.Chip} id="meet_date" icon={<EventIcon style={{color: "#ffffff"}}/>} label={data.meet_date} />
        </Grid>
      </div>
    </div>     
  );
}