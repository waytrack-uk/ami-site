import React from "react";

const Contact = () => {
  const contacts = [
    {
      name: "Alexander Bloom",
      position: "Archive team",
      email: "alexanderbloom@waytrack.co.uk",
      imageUrl: "/alexanderbloom.png"
    },
    {
      name: "Aron Finkelstein",
      position: "Archive team", 
      email: "aronfinkelstein@waytrack.co.uk",
      imageUrl: "/aronfinkelstein.jpg"
    }
  ];

  return (
    <div className="min-h-screen w-full flex items-start md:items-center">
      <div className="w-full pr-6 md:px-0 pt-8 md:pt-0">
        <div className="ml-auto md:mx-auto w-full max-w-[400px] px-6 md:px-8">
          {contacts.map((contact, index) => (
            <div key={index} className="mb-8 md:mb-12 flex items-start">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden flex-shrink-0 mr-4">
                <img 
                  src={contact.imageUrl} 
                  alt={`${contact.name}'s profile`} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2 text-gray-900">
                  {contact.name}
                </h2>
                <p className="text-lg md:text-xl mb-3 md:mb-4 text-gray-600">
                  {contact.position}
                </p>
                <p className="text-base md:text-xl leading-relaxed mb-1 text-gray-900 break-words">
                  {contact.email}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Contact;