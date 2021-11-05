import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Paper, Typography } from '@material-ui/core';
import Chart from './Chart';

const useStyles = makeStyles((theme) => ({
  root: {
      width:"85%",
      height:"50%",
      marginTop:"1%",
      marginLeft:"10%",
  },
  paper: {
      marginLeft:"1%",
      width:"100%",
      height:"100%", 
      paddingTop:"1%",
      marginTop:"3%",
  },
  data: {
      overflow:"auto",
      height:"100%",
      '&::-webkit-scrollbar' : {
          display : 'none'
      },
  },
}));

export default function Script(prop) {
  const classes = useStyles();

  
}