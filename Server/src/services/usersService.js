import usersRepo from'../repositories/usersRepo.js';

const getAllUsers = (query) => {
  try {
    return usersRepo.getAllUsers(query);
  } 
  catch (error) {
    return { errorMsg: `A db error has accuoreded: ${error.message}` };
  }  
};

const getUserById = (id) => {
  try{
    return usersRepo.getUserById(id);
  }
  catch (error) {
    return { errorMsg: `A db error has occurred: ${error.message}` };
  }
};

const getUserByEmail = async (email) => {
  try {
    return usersRepo.getUserByEmail(email);
  }
  catch (error) {
    return { errorMsg: `A db error has occurred: ${error.message}` };
  }
};

const createUser = async (obj) => {
  // const checkIfUserExists = await getAllUsers({ email: obj.email, username: obj.username });
  // console.log(`checkIfUserExists ${checkIfUserExists.length}`);
  // if(checkIfUserExists.length > 0) {
  //   return {errorMsg: 'User already exists'};
  // }
  try{
    return usersRepo.createUser(obj);
  }
  catch (error) {
    return { errorMsg: `A db error has occurred while: ${error.message}` };
  }
};

const updateUser = (id, obj) => {
  try { 
    return usersRepo.updateUser(id, obj);
  }
  catch (error) {
    return { errorMsg: `A db error has occurred: ${error.message}` };
  }
};

const deleteUser = (id) => {
  try{
    return usersRepo.deleteUser(id);
  }
  catch (error) {
    return { errorMsg: `A db error has occurred: ${error.message}` };
  }
};

const saveUser = (user) => {
  return usersRepo.saveUser(user);
};

const addFriends = async (requester, recipient) => {
  
  if (!requester || !recipient) {
    return { errorMsg: 'addFriends: missing requesterId or recipientId' };
  }

  if (String(requester) === String(recipient)) {
    return { errorMsg: 'addFriends: requester and recipient are the same' };
  }
  
  const users = await getAllUsers({ _id: { $in: [requester, recipient] } });

  if (!Array.isArray(users) || users.length !== 2) {
    return { errorMsg: `addFriends: expected 2 users, got ${users?.length ?? 0}` };
  }

const [u0, u1] = users[0]._id.equals(requester) ? [users[0], users[1]] : [users[1], users[0]];

  const already0 = (u0.friends || []).some(id => id.equals(u1._id));
  const already1 = (u1.friends || []).some(id => id.equals(u0._id));

  if (already0 || already1) {
    return { errorMsg: `You are already friends with -> ${u0.userName}` };
  }

  u0.friends.push(u1._id);
  u1.friends.push(u0._id);

  await Promise.all(users.map(user => saveUser(user)));
  return {afMsg: `${users[0].userName} and ${users[1].userName} seccessfuly became friends`};
};

const deleteFriends = async (deleter, deleted) => {
  const users = await getAllUsers({$or: [{_id: deleter}, {_id: deleted}] });
  for(let i = 0; i < users.length; i++){
    const friend = users[(i + 1) % 2];
    allReadyDeleted = !users[i].friends.includes(friend._id);
    if(allReadyDeleted){
      return {errorMsg: `You allready deleted -> ${friend.userName}`}
    }
    const userToDeleteIndex = users[i].friends.indexOf(friend._id);
    if(userToDeleteIndex === -1){
      return {errorMsg: `You allready deleted -> ${friend.userName}`}
    }
    users[i].friends.splice(userToDeleteIndex, 1);
  }

  await Promise.all(users.map(user => saveUser(user)));
  return {afMsg: `${users[0].userName} and ${users[1].userName} seccessfuly stoped being friends`};


}

export default {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  saveUser,
  addFriends,
};
