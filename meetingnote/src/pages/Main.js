import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Header from "../Components/Header";

const useStyles = makeStyles((theme) => ({
  sideBar: {
    minWidth: 230,
    width: "23%",
    minHeight: window.innerHeight,
    backgroundColor: "#ffc31e",
  },
  list:{
    marginBottom:"5%",
    height:"80%",
    overflow: "auto",
    '&::-webkit-scrollbar' : {
        display : 'none'
    }
  },
  clickGroup: {
    backgroundColor: "#ffffff"
  },
  listTitle: {
    paddingTop: "4%",
    marginBottom: "15%",
  },
  exitIcon: {
    width: 20,
    height: 20,
    color: "#ffffff",
    marginLeft: "20%"
  },
  groupBtn: {
    width: "100%",
    height: "10%",
    "&:hover": {
      backgroundColor: "#ab861f",
      color: "black"
    },
  },
  selectGroupBtn: {
    width: "100%",
    height: "10%",
    backgroundColor: "#000000",
    color: "#ffffff",
    "&:hover": {
      backgroundColor: "#000000",
      color: "white"
    },
  },
  body: {
    minWidth: 1000,
    height: window.innerHeight - 62,
    justifyContent:"center"
  },
  logo:{
    marginTop:"10%",
  },
}));

export default function InteractiveList() {
  return (
    <div style={{width: "100%", height: "90%"}}>
      <Header>
      </Header>
    </div>
  );
}