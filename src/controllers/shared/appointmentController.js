// import  from "./../models/";
// import {  } from '../utils/'



export const getAllshared/appointment = (req, res) => {


  res.send("Get all shared/appointment");
};



export const getshared/appointment = (req, res) => {


  res.send(`Get single shared/appointment with id ${req.params.id}`);
};



export const createshared/appointment = (req, res) => {

  
  res.send("Create new shared/appointment");
};


export const updateshared/appointment = (req, res) => {


  res.send(`Update shared/appointment with id ${req.params.id}`);
};



export const deleteshared/appointment = (req, res) => {


  res.send(`Delete shared/appointment with id ${req.params.id}`);
};