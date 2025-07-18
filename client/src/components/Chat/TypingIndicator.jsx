import React from 'react';

const TypingIndicator = ({ typingUsers }) => {
  // Handle both array and object structures
  let typingUsersArray = [];
  
  if (Array.isArray(typingUsers)) {
    typingUsersArray = typingUsers;
  } else if (typingUsers && typeof typingUsers === 'object') {
    // If it's an object, extract the values (usernames)
    typingUsersArray = Object.values(typingUsers);
  }

  if (typingUsersArray.length === 0) return null;

  return (
    <div className="px-4 py-2 text-sm text-gray-500 italic">
      {typingUsersArray.length === 1 
        ? `${typingUsersArray[0]} is typing...`
        : `${typingUsersArray.join(', ')} are typing...`
      }
    </div>
  );
};

export default TypingIndicator;