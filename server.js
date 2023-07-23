const mongoose = require('mongoose');
const app = require('./app');

const port = process.env.PORT;
const mongo_url = process.env.MONGO_URL;

(() => {
    mongoose.connect(mongo_url, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    })
    .then(dbHost => console.log(`Connected To DB: ${dbHost.connection.host}`))
    .catch(error => console.log(error))
    
    app.listen(port, () => {
        console.log(`Server is listening on ${port}`);
        console.log(`http://localhost:${port}`);
    });

})();
