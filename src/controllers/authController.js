// import  from "./../models/";
// import {  } from '../utils/'



export const getAllauth = (req, res) => {


  res.send("Get all auth");
};



export const getauth = (req, res) => {


  res.send(`Get single auth with id ${req.params.id}`);
};



export const createauth = (req, res) => {

  
  res.send("Create new auth");
};


export const updateauth = (req, res) => {


  res.send(`Update auth with id ${req.params.id}`);
};



export const deleteauth = (req, res) => {


  res.send(`Delete auth with id ${req.params.id}`);
};