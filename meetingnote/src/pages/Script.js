import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import MeetScript from "../Components/Meetscript";

const useStyles = makeStyles((theme) => ({
  listTitle: {
    paddingTop: "4%",
    marginBottom: "15%"
  },
  body: {
    minWidth: 1230,
    height: window.innerHeight - 60,
    justifyContent: "center"
  },
}));

function getUrlParams() {
  var params = {};
  window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str, key, value) { params[key] = value; });
  return params;
}

export default function Script() {
  const classes = useStyles();
  const meet_name = getUrlParams().meet_name;

  return (
    <div style={{ display: "flex", minWidth: 1230}}>
      <div style={{width: "100%", height: "90%"}}>
        <div className={classes.body}>
          <div style={{height: "88%", width: "98%", justifyContent: "center"}}>
            <MeetScript meet_name={meet_name}/>
          </div>
        </div>
      </div>
    </div>
  )
}