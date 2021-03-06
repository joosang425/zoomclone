import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import LogoutIcon from '@material-ui/icons/LockOpen';

const useStyles = makeStyles((theme) => ({
  header: {
    minWidth: 1000,
    backgroundColor: "#72c7fc",
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center"
  },
  divStyle: {
    backgroundColor:"#72c7fc",
  },
}));

export default function Header(prop) {
  const classes = useStyles();

  const handleClickLogout = () => {
    sessionStorage.setItem("user_id",'');
    sessionStorage.setItem("user_name",'');
    alert("로그아웃 되었습니다.");
    window.location.href = '/';
  };

  return (
    <div className={classes.header}>
      <span style={{color: "#ffffff", fontWeight: "bold", maxWidth: "100%", marginRight: "1%"}}>{sessionStorage.getItem("user_name")}님</span>
      <Button className={classes.divStyle} style={{margin: "1%",backgroundColor:"#0065fc"}} onClick={handleClickLogout} color="primary" variant="contained">
        <LogoutIcon />&nbsp; 로그아웃
      </Button>
    </div>
  );
}