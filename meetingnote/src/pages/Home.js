import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import  Container  from '@material-ui/core/Container';
import  CssBaseline  from '@material-ui/core/CssBaseline';
import  TextField  from '@material-ui/core/TextField';
import  Typography  from '@material-ui/core/Typography';
import logo from '../Icons/meetingnote_logo.png';
import  Button  from '@material-ui/core/Button';
import  Link  from '@material-ui/core/Link';

const useStyles = makeStyles((theme) => ({
  header:{
    minWidth: 1000,
    backgroundColor: "#000000",
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center"

  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    width: '60%',
    marginTop: theme.spacing(1),
  },
  submit: {
    marginTop: '3%',
    marginBottom: '5%',
    backgroundColor:"#50bcdf",
    width: "100%",
    height: "36px",
  },
  logo: {
    marginTop: '10%',
    marginBottom: '0%',
    height: '40%',
  },
}));

export default function SignIn() {
  const classes = useStyles();
  const [userid, setUserid] = useState('');
  const [pw, setPw] = useState('');

  const handleClick = () => {
    if(userid === '' || pw === ''){
      alert("아이디와 비밀번호를 입력하세요");
    }
    else {
      var myHeaders = new Headers();
      myHeaders.append("Content-Type","application/json");

      var raw = JSON.stringify( { "user_id": userid, "user_pw": pw });
      
      var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
      };

      fetch("/check_login", requestOptions)
      .then(res => res.json())
      .then(result => {
        if(result.code !== 0) alert("아이디 혹은 비밀번호가 틀렸습니다.");
        else {
          alert(`${result.user_name}님 환영합니다!`);
          sessionStorage.setItem("user_id", result.user_id);
          sessionStorage.setItem("user_name", result.user_name);
          sessionStorage.setItem("preTab", -1);
          window.location.href='/main';
        }
      })
      .catch(error => console.log('error', error))
    }
  };

  const onKeyPress = (e) => {
    if(e.key === 'Enter'){
      handleClick();
    }
  }

  return(
    <Container component="main" style={ { width: 600, height: window.innerHeight,paddingTop:"1%" }}>
      <CssBaseline />
      <img src = { logo } className = { classes.logo } alt = 'logo'/>
      <div className = { classes.paper }>
        <Typography component = "h1" variant = "h6">
          THIS IS MEETINGNOTE<br></br>WELCOME HERE!
        </Typography>
        <form className = { classes.form } noValidate>
          <TextField
          variant = "standard"
          margin = "normal"
          label = "아이디"
          required
          fullWidth
          name = "id"
          autoFocus
          value = { userid }
          size = "medium"
          onChange = { ( { target: { value } } ) => setUserid(value)}
          onKeyPress = { onKeyPress }
          />
          <TextField
          variant = "standard"
          margin = "normal"
          required
          fullWidth
          name = "password"
          label = "비밀번호"
          type = "password"
          value = { pw }
          size = "medium"
          onChange = { ( { target: { value } } ) => setPw(value)}
          onKeyPress = { onKeyPress }
          />
          <Button
          variant = "contained"
          color = "primary"
          size = "large"
          className = { classes.submit }
          onClick = { handleClick }
          >
            LOGIN
          </Button>
          <br/>
          <Link href = "/Signup" variant = "body2" style={ {display:"inline-block",marginRight: "14px", fontWeight: "bold", color:"#676565"} } >
            {"회원가입"}
          </Link>
          &nbsp;&nbsp;
          <Link href = "/find_pw" variant = "body2" style={ {display:"inline-block",marginRight: "14px", fontWeight: "bold",color:"#676565"}}>
            {"비밀번호 재설정"}
          </Link>
        </form>
      </div>
    </Container>
  );
}