import React from "react";
function LeftNavbar({username,id,on}){
return(
    <>
          <div className=" bg-slate-100 rounded-2xl">
                        <div className="min-h-screen">

                            <div className="w-full">
                                <div className="p-5 w-20 float-left">
                                    <img className="rounded-full" src="/img/profile-user.png" alt="" />
                                </div>
                                <div className="pt-5">
                                    <a className="text-2xl font-bold hover:cursor-pointer" href={`/profile/${id}`}>{username}</a>
                                </div>
                            </div>
                            <div className="w-full">

                                <div className="w-full pt-14">
                                    <div className="w-full border-t-2 border-b-2 border-slate-200">
                                        <div className="w-2/3 pl-7 pt-3 pb-3">
                                            <div className="w-full ">
                                                <div className="w-1/6 float-left">
                                                    <img src="/img/people.png" alt="" />
                                                </div>
                                                <div className="pl-12">
                                                
                                                    <a href="/teams" className={` ${on === "team" ? "text-xl" : "text-base"}`}>Teams</a>
                                                </div>
                                            </div>


                                        </div>

                                    </div>
                                    <div className="w-full border-t-2 border-b-2  border-slate-200">
                                        <div className="w-2/3 pl-7 pt-3 pb-3">
                                            <div className="w-full ">
                                                <div className="w-1/6 float-left">
                                                    <img src="/img/task-list.png" alt="" />
                                                </div>
                                                <div className="pl-12">
                                                <a href="/gettask" className={` ${on === "task" ? "text-xl" : "text-base"}`}>Task</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

    </>
);
}

export default LeftNavbar;