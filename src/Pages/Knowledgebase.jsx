export default function KnowledgeBase() {
    return (
        <div className="max-w-6xl mx-auto px-4 py-8" >

            {/* Intro section */}
            <div className="px-6 py-6 mx-4 my-8 rounded-xl bg-gray-100 space-x-4 space-y-6" >
                <p className=" px-2 py-4 mx-4 my-2 font-extrabold font-sans text-xl md:text-2xl lg:text-5xl " >Empower IT Ticket System.</p>
                <div>
                    <p className="text-xl px-4 py-2 mx-4 my-2 " >Welcome to the Knowledge base section . This is going to be your one-stop documentation for all features and functionalities of the system.</p>
                </div>
            </div>

            {/* Links section */}
            <div className="px-3 py-6 mx-4 my-8 rounded-xl  flex flex-row space-x-4 bg-gray-100  justify-center  " >
                <p className="text-lg" ><a href="#About">About</a></p>
                <p className="text-lg" ><a href="#Roles">Roles</a></p>
                <p className="text-lg" ><a href="#Mission">Mission</a></p>
                <p className="text-lg" ><a href="#Authentication">Pages</a></p>
            </div>

            {/* Middle section */}
            <div className="px-3 py-6 mx-4 my-8 rounded-xl bg-gray-100 space-x-4 space-y-6 " >
                <h2 className="text-3xl font-bold px-2 py-4 mx-4 my-2 " id="About" > About </h2>
                <p className="text-xl px-4 py-2 mx-4 my-2 " >EmpowerIT is a web-based ticketing system designed to streamline communication between
                    employees and the IT department within an organization. The system allows staff to create support
                    tickets when experiencing technical difficulties, and ensures that IT technicians and administrators
                    (directors) can monitor, prioritize, and respond to these requests in real-time.</p>
                <h2 className="text-3xl font-bold px-2 py-4 mx-4 my-2 " id="Roles" >Roles </h2>
                <ol className="text-xl" >
                    <li className="px-4 py-2 mx-4 my-2" >User</li>
                    <li className="px-2 py-4 mx-4 my-2" >IT technician</li>
                    <li className="px-2 py-4 mx-4 my-2" >Administrator</li>
                </ol>
            </div>

            {/* Mission section */}
            <div className="px-3 py-6 mx-4 my-8 rounded-xl bg-gray-100 space-x-4 space-y-6 " >
                <h2 id="Mission" className="text-3xl font-bold  " >Mission</h2>
                <p className="text-xl px-4 py-2 mx-4 my-2 " >To streamline and enhance internal IT support within organizations by providing an
                    efficient, transparent, and user-friendly ticketing platform that ensures timely resolution of
                    technical issues, empowers employees, and promotes accountability and collaboration among IT
                    staff.
                </p>
            </div>

            {/* Pages section */}
            <div className="px-3 py-6 mx-4 my-8 rounded-xl bg-gray-100 space-x-4 space-y-6 " >
                <h2 id="Authentication" className="text-3xl font-bold  " > Signing up </h2>
                <p className="text-xl" > You must sign up to use the system . To sign up ,
                    navigate to the Sign In section and switch to sign up . Enter Your
                    details and select your role. Click sign up to complete the process
                </p>
                <h2 id="Authentication" className="text-3xl font-bold  " >Signing in </h2>
                <p className="text-xl" >
                    This is for users who have already signed up . Press Sign In on the navbar .
                    Enter your details and click on the Sign in button . You will
                    be logged in to a dashboard according to your role.
                </p>
                <h2 className="text-3xl font-bold  " >Dashboard </h2>
                <p className="text-xl" >
                    The dashboard is the first page you will see after signing in . It contains details on the tickets. The details are
                    Total tickets available,
                    Tickets assigned,
                    Tickets unassigned,
                    Tickets resolved on the technician's side and
                    Total Tickets
                    Open
                    In progress
                    Resolved on the user side.

                </p>
                <h2 className="text-3xl font-bold  " >Tickets </h2>
                <p className="text-xl" >
                    For technicians , Tickets are a place where all details on
                    tickets are viewed. All tickets are displayed and can be assigned
                    to a technician or another . Users also have a tickets section that
                    allows them to create tickets and post them to technicians and administrators.
                    The tickets section also allows users to view their tickets and the status of each ticket.
                </p>
                <h2 className="text-3xl font-bold  " >Knowledge Base </h2>
                <p className="text-xl" >
                    View all the documentation on the system and how to use it in the knowledge base section.
                    The knowledge base is a place where all the documentation on the system is stored.
                </p>
                <h2 className="text-3xl font-bold  " >Notifications</h2>
                <p className="text-xl" >
                    Get all the relevant notifications on the system in the notifications section.
                </p>
                <h2 className="text-3xl font-bold  " >Profile </h2>
                <p className="text-xl" >
                    Have a quick view of your profile to
                    view your account name , Email and role. You can
                    edit some details and log out of the system. </p>
            </div>
        </div>
    );
}