const { Server } = require("socket.io");
const mongoose = require('mongoose');
const Document = require('./document');


const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/DocNest';

const connectToDatabase = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify : false,
            serverSelectionTimeoutMS: 30000, // 30 seconds timeout
        });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err.message);
    }
};

connectToDatabase();



const PORT = process.env.PORT || 3002;
const codespaceClientUrl = process.env.CODESPACE_NAME && process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN
    ? `https://${process.env.CODESPACE_NAME}-5173.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`
    : null;
const CLIENT_URL = process.env.CLIENT_URL || codespaceClientUrl || "http://localhost:5173";

const io = new Server(PORT, {
    cors: {
        origin: CLIENT_URL,
        methods: ["GET", "POST"],
    },
});

const defaultValue = ""

io.on('connection', (socket) => {
    console.log("A user connected with user id : ", socket.id)
    socket.on('get-document' , async documentId =>{
        const document = await findOneCreateDocument(documentId)
        socket.join(documentId)
        socket.emit('load-document' , document.data)

        socket.on('send-changes', (delta) => {
            socket.broadcast.to(documentId).emit('receive-changes', delta);
        });
        socket.on('save-document' , async data => {
            await Document.findByIdAndUpdate(documentId, {data})
        })
    })

   

    socket.on('disconnect', () => {
      console.log("A user disconnected with user id : ", socket.id)
    });
});

// Global error handler
io.on('error', (err) => {
    console.error('Socket.IO error:', err);
});




console.log(`Socket.IO server running on port ${PORT}`);


async function findOneCreateDocument (id){
    if(id == null) return
    const document = await Document.findById(id)
    if(document) return document
    return await Document.create({_id : id , data : defaultValue})
}