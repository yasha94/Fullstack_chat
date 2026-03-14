import bcrypt from 'bcrypt';


const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const comparePasswords = async (password, hash) => {
  console.log(`compare: ${await bcrypt.compare(password, hash)}`);
  return await bcrypt.compare(password, hash);
};

export default {
  hashPassword,
  comparePasswords,
};