import mongoose from 'mongoose';


const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/chatDB');
    console.log('Connected to chatDB');
  } catch (error) {
    console.error('Error connecting to chatDB:', error);
  }
};

export default connectDB;








