const { default: mongoose } = require("mongoose");

const dbConnect = async () => {
    try {
        // Aguardar até que a conexão com o banco de dados seja estabelecida
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Database connected");
    } catch (error) {
        console.log("Database connection failed:", error.message);
    }
}

module.exports = dbConnect;
