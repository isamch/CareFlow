// import  from "./../models/";
// import {  } from '../utils/'



export const getAllpatient/record = (req, res) => {


  res.send("Get all patient/record");
};



export const getpatient/record = (req, res) => {


  res.send(`Get single patient/record with id ${req.params.id}`);
};



export const createpatient/record = (req, res) => {

  
  res.send("Create new patient/record");
};


export const updatepatient/record = (req, res) => {


  res.send(`Update patient/record with id ${req.params.id}`);
};



export const deletepatient/record = (req, res) => {


  res.send(`Delete patient/record with id ${req.params.id}`);
};