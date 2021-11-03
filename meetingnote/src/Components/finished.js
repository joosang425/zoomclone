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
      backgroundColor: "#ffc31e",
      marginTop:"1%",
      marginRight:"3%",
      height:"10%",
      fontSize: 14
  },
  ScriptChip: {
      fontSize: 14,
      backgroundColor: "#000000",
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
  grow: {
      flexGrow: "1%",
      paddingTop: "2%",
      marginBottom: "2%",
    },
  search: {
      position: 'relative',
      borderRadius: 20,
      backgroundColor: "#A9A9A9",
      marginRight: "1%",
      marginLeft: "3%",
      width: '94%',
    },
  searchIcon: {
      marginLeft:"5%",
      height: '100%',
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  inputRoot: {
      color: 'inherit',
      width: "75%",
    },
  inputInput: {
      paddingTop: "3%",
      paddingBottom: "3%",
      paddingLeft: "3%",
      width: '100%'
    },
  cancelBtn:{
      color:"#eaeaea", 
      verticalAlign:'middle',
      "&:hover": {
          color: "#000000",
      },
  }
}));

export default function Finished(prop) {
  const classes = useStyles();
    const [list, setList] = useState([]);

    const getList = (prop) => {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({ "meet_id": prop.meet_id});

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch("/finishedmeet_list", requestOptions)
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

        fetch("/finishedmeet-open", requestOptions)
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
    
        fetch("/finishedmeet-delete", requestOptions)
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
    <Paper elevation={3} style={{height:"100%", paddingTop:"1%"}}>
        <Typography variant="h6" align="center">
            <span style={{fontWeight: "bold", textDecoration:"underline overline", textDecorationColor:"#3f51b5"}}>Finished</span>   
        </Typography>
        <div style={{backgroundColor:"#eaeaea", width:"90%", height:"85%",borderRadius:10, margin:"auto"}}>
        <List className={classes.list}>
            {list && list.map(data => (
                <ListItem key={data.meet_id} id='data' className={classes.data}>
                    <div style={{display:'block', width:"100%", margin:"2%"}}>
                        <div className={classes.ScheduledName}>
                        <DeleteForever onClick={()=> handleDeleteIcon(data.meet_id)} className={classes.deleteBtn} color="error"/>
                        </div>
                        <Grid>
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