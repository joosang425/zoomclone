import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Header from "../Components/Header";
import Scheduled from "../Components/schedule";
import Finished from "../Components/finished";

const useStyles = makeStyles((theme) => ({
  body: {
    minWidth: 1000,
    height: window.innerHeight - 62,
    justifyContent:"center"
  },
}));

export default function InteractiveList() {
  const classes = useStyles();

  return (
    <div style={{width: "100%", height: "90%"}}>
      <Header />
      <div className={classes.body}>
        <div style={{display: "flex", height: "90%", alignItems: "center", justifyContent: "center", width: "94%", margin: "auto"}}>
          <Scheduled /><Finished />
        </div>
      </div>
    </div>
  );
}