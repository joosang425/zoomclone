import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Paper, Typography, Chip, Grid} from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import DescriptionIcon from '@material-ui/icons/Description';
import DeleteForever from '@material-ui/icons/DeleteForever';

const useStyles = makeStyles((theme) => ({
  root: {
      width:"45%",
      height:"90%",
      margin:"1%"
  },
  list:{
      height:"85%",
      overflow: "auto",
      paddingTop: 0,
      paddingBottom:0,
      '&::-webkit-scrollbar' : {
          display : 'none'
      }
  },
  Chip: {
      backgroundColor: "#cfe8ec",
      marginTop:"1%",
      marginRight:"3%",
      height:"10%",
      fontSize: 14
  },
  ScriptChip: {
      fontSize: 14,
      backgroundColor: "#cdcdcd",
      color: "#ffffff",
      marginTop:"1%",
      marginRight:"3%",
      height:"10%",
      "&:hover": {
        backgroundColor: "#8c8c8c",
        color: "white"
      },
  },
  data:{
      backgroundColor:"#ffffff",
      width:"95%",
      height: "auto",
      margin:"auto",
      borderRadius:10,
      padding:0,
      marginBottom:"2%",
      marginTop:"5%",
  },
  ScheduledName: {
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
      verticalAlign: "middle",
  },
  deleteBtn:{
      "&:hover": {
          color: "#ffa0a0",
      },
  },
}));

export default function Finished(prop) {
  const classes = useStyles();
    const [list, setList] = useState([]);

    const getList = (prop) => {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type","appliction/json");

        fetch("/meet_list", {
            method: "POST",
            headers: myHeaders,
            redirect: "follow"  
        })
            .then(res => res.json())
            .then(result => {
                console.log(result)
                if(result.code === 0) {
                    setList(result.lists);
                }
                else{
                    setList('');
                }
            })
            .catch(error => console.log('error', error))
    };

    useEffect(() => {
        getList(prop);
      }, [prop]);

    const handleClickScript =(meet_id) => {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({ "meet_id": meet_id});

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch("/meet_open", requestOptions)
            .then(res => res.json())
            .then(result => {
                console.log(result)
                if(result.code === 0) {
                    window.location.href=`/script?meet_id=${meet_id}`;
                }
                else if(result.code === 37){
                    alert("스크립트가 삭제되었거나, 유효하지 않은 스크립트입니다.");
                }
            })
            .catch(error => console.log('error', error))
    }

    const handleDeleteIcon = (meet_id) => {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
    
        var raw = JSON.stringify({ "meet_id": meet_id });
    
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };
    
        fetch("/meet_delete", requestOptions)
            .then(res => res.json())
            .then(result => {
                console.log(result);
                if (result.code === 0) {    
                    alert("회의 정보를 삭제합니다");
                    getList(prop);
                }
            })
            .catch(error => console.log('error', error))
    }

  return (
    <div className={classes.root}>
    <Paper elevation={3} style={{height:"100%", paddingTop:"1%",boxShadow:"none"}}>
        <Typography variant="h6" align="center">
            <span style={{fontWeight: "bold", textDecoration:"underline", textDecorationColor:"#99ccff"}}>종료된 회의방</span>   
        </Typography>
        <div style={{backgroundColor:"#f7f6e1", width:"90%", height:"85%",borderRadius:10, margin:"3% auto auto",boxShadow:"0px 3px 3px -2px rgb(0 0 0 / 20%), 0px 3px 4px 0px rgb(0 0 0 / 14%), 0px 1px 8px 0px rgb(0 0 0 / 12%)"}}>
        <List className={classes.list}>
        {list && list.map(data => (
                        <ListItem key={data.meet_name} id='data' className={classes.data}>
                            <div style={{display:'block', width:"100%", margin:"2%"}}>
                                <div className={classes.ScheduledName}>
                                <DeleteForever onClick={()=> handleDeleteIcon(data.meet_id)} className={classes.deleteBtn} color="error"/>
                                <span style={{fontWeight:"bold", color:"black"}}>{data.meet_name}</span>
                                </div>
                                <Grid>
                                    <Chip className={classes.Chip} id="meet_date" label={data.meet_date}/>
                                    <Chip className={classes.ScriptChip} id="script" onClick={() => handleClickScript(data.meet_id)} icon={<DescriptionIcon style={{ color: "white" }}/>} label="SCRIPT"/>
                                </Grid>
                            </div>
                        </ListItem>
                    ))}
        </List>
        </div>
    </Paper> 
</div>
  );
}