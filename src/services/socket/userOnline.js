const users = []
const addUser = ({ id, usersId }) => {
    let error;
    // clean the data
    console.log("users before===",users)
    usersId = usersId.trim().toLowerCase()

    // check for existing users
    const existingUser = users.find((user) => {
        return user.usersId === usersId
    })

    // va;idate username
    if (existingUser) {
        // return {
        //     error: "username iss already used"
        // }
        error={error: "Người dùng tồn tại"} ;
    }

    // store user
    const user = { id, usersId }
 
    users.push(user)
    console.log("users after===",users)
    
    return { user,error }
}
const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => {
        return user.id === id
    })
}
const getListUser = () => {
    return users;
}
/*
const getUserInRoom = (room) => {

    users.filter((user) => {

        user.room === room
    })

    console.log(users)

    return users

}
*/

module.exports = {
    addUser, removeUser, getUser,getListUser
}