import React,{useState} from 'react';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import logo from '../Icons/meetingnote_logo.png';
import  Link  from '@material-ui/core/Link';
import  Typography  from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
  paper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: theme.palette.primary.main,
  },
  form: {
    width: '100%', 
  },
  submit: {
    marginTop:"5%"
  },
  logo:{
    marginTop: "10%",
    height:"25%",
    marginBottom: "10%",
  },
}));


function checkId(userId) {
    var idReg = /^[a-z]+[a-z0-9]{5,19}$/g;
    if(!idReg.test(userId))
      return true;
  
    return false;
  }

function checkPw(userPw) {
  var pwReg = /[#$%&*()_+|<>?:{}]/;
  if(pwReg.test(userPw))
    return true;
  
  return false;
}


export default function Change() {
  const classes = useStyles();  
  const [user_id, setUserId] = useState('');
  const [user_pw, setUserPw] = useState('');
  const [user_pwcheck, setUserPwcheck] = useState('');

  
  const handleIdChange = (e) => {
    setUserId(e.target.value);
  }
  const handlePwChange = (e) => {
    setUserPw(e.target.value);
  }
  const handlePwCheckChange = (e) => {
    setUserPwcheck(e.target.value);
  }
  const handleSubmit = () => {
    if (user_id === '' || user_pw === '' || user_pwcheck === ''){
      alert("모든 정보를 입력해주세요.");
    }
    else if (checkId(user_id)) {
        alert("아이디는 영문자로 시작하는 6~20자 영문자 또는 숫자이어야 합니다.");
    }
    else if (checkPw(user_pw)) {
      alert("비밀번호에 가능한 특수문자는 ~!@^ 입니다.");
    }
    else if(user_pw !== user_pwcheck) {
      alert("비밀번호를 다시 확인해주시기 바랍니다.");
    }
    else {
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      var raw = JSON.stringify({ "user_id" : user_id, "user_pw": user_pw });

      var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
      };

      fetch("/change", requestOptions)
      .then(response => response.json())
      .then(result => {
        console.log(result);
        if(result.code === 0) {
          alert("비밀번호가 재설정되었습니다.");
          window.location.href = "/";
        }
        else if(result.code === 3) {
          alert("다시 시도해주십시오.");
        }
      })
      .catch(error => console.log("error", error));
    }
  }

  const onKeyPress = (e) => {
    if(e.key === 'Enter') {
      handleSubmit();
    }
  }

  return (
    <Container component="main" style = { {width : 400, height: window.innerHeight }}>
      <CssBaseline />
      <a href = "/">
        <img src = {logo} className = {classes.logo} alt = "logo"/>
      </a>
      <div className = {classes.paper}>
      <Typography component = "h1" variant = "h6">
          CHANGE PASSWORD
        </Typography>
          
        <form className = {classes.form} noValidate>
          <Grid container spacing = {2}>
          <Grid item xs = {12}>
              <TextField
              name = "id"
              variant = "standard"
              required
              fullWidth
              id = "id"
              label = "아이디"
              value = {user_id}
              onChange = {handleIdChange}
              //autoFocus
              size = "medium"
              onKeyPress = {onKeyPress}
              />
            </Grid>
            <Grid item xs = {12}>
              <TextField
              name = "password"
              variant = "standard"
              required
              fullWidth
              id = "password"
              label = "비밀번호"
              type = "password"
              value = {user_pw}
              onChange = {handlePwChange}
              //autoFocus
              size = "medium"
              onKeyPress = {onKeyPress}
              />
            </Grid>
            <Grid item xs = {12}>
              <TextField
              name = "passwordcheck"
              variant = "standard"
              required
              fullWidth
              id = "passwordcheck"
              label = "비밀번호 확인"
              type = "password"
              value = {user_pwcheck}
              onChange = {handlePwCheckChange}
              //autoFocus
              size = "medium"
              onKeyPress = {onKeyPress}
              />
            </Grid>
          </Grid>
          <Button
          size = "large"
          variant = "contained"
          color = "primary"
          className = {classes.submit}
          onClick = {handleSubmit}
          style={{backgroundColor:"#50bcdf"}}
          >
            CHANGE PASSWORD
          </Button>
          &nbsp; &nbsp;
          <Link href = "/" variant = "body2" style={{color:"#676565",fontWeight: "bold"}}>
            {"홈으로 돌아가기"}
          </Link>
        </form>
      </div>
    </Container>
  );
}