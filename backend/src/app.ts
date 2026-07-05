import express from 'express';

import cors from 'cors';


const app = express();


app.use(cors()); 

app.use(express.json()); 



app.get('/api/health', (req, res) => {

  res.json({ status: 'OK', message: 'TaskCraft AI API is running smoothly.' });

});


export default app;