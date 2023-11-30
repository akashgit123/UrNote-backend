const express = require('express');
const router = express.Router();
const Note = require('../models/Notes');
const fetchUser = require('../middleware/fetchUser');
const {body,validationResult} = require('express-validator');


router.get('/fetchAllNotes',fetchUser,async(req,res)=>{
    try{
        const notes =await Note.find({user: req.user.id});
        res.json(notes);
    }
    catch(err){
        console.log(err.message);
        console.log(err);
        return res.send({ error : "Something went wrong catch" }).status(400);        
    }
})

router.post('/addNote',fetchUser,
    [
    body('title').isLength({min:3}).withMessage('Enter a title (atleast 3 characters are required)'),
    body('description').isLength({min:5}).withMessage('Enter a description (atleast 5 characters are required)')
    ],
    async(req,res)=>{
    try{
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.send({ errors: result.array() }).status(400);
        }
        const {title,description,tag} = req.body;
        const newNote = new Note({
            title,
            description,
            tag,
            user : req.user.id
        });

        const savedNote = await newNote.save();
        res.json(savedNote);
    }
    catch(err){
        console.log(err.message);
        console.log(err);
        return res.send({ error : "Something went wrong catch" }).status(400);        
    }
})

router.put('/updateNote/:Id',fetchUser,async(req,res)=>{
    try{
        const {title,description,tag} = req.body;

        const newNote = {};
        if(title){newNote.title = title};
        if(description){newNote.description = description};
        if(tag){newNote.tag = tag};
        // console.log(newNote);
    
        let note =await Note.findById(req.params.Id);
        // console.log(note);
        if(!note){
            return res.status(404).send("Not found");
        }
    
        if(note.user.toString() !== req.user.id){
            return res.status(401).send("Not allowed");
        }
    
        note = await Note.findByIdAndUpdate(req.params.Id , {$set:newNote},{new:true});
        res.json({note});
    }
    catch(err){
        console.log(err.message);
        console.log(err);
        return res.send({ error : "Something went wrong catch" }).status(400);        
    }

})

router.delete('/deleteNote/:Id',fetchUser,async(req,res)=>{
    try{
        let note =await Note.findById(req.params.Id);
        // console.log(note);
        if(!note){
            return res.status(404).send("Not found");
        }

        if(note.user.toString() !== req.user.id){
            return res.status(401).send("Not allowed");
        }

        note = await Note.findByIdAndDelete(req.params.Id);
        res.json({
            "Success":"Note has been deleted",
            note : note
        });
    }
    catch(err){
        console.log(err.message);
        console.log(err);
        return res.send({ error : "Something went wrong catch" }).status(400);        
    }
})

module.exports = router;