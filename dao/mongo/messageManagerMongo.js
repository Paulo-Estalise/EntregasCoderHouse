const Message = require('../models/message.model');

class MessageManagerMongo {
    async addMessage(messageData) {
        const message = new Message(messageData);
        return await message.save();
    }

    async getMessages() {
        return await Message.find().sort({ timestamp: 1 });
    }
}

module.exports = new MessageManagerMongo();
