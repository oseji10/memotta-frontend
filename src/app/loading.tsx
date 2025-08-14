// const Loading = () =>{
//     return(
//         <div>Loading</div>
//     )
// }

// export default Loading;
const Loading = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50 overflow-hidden">
      <div className="absolute top-0 left-0 h-full bg-blue-500 animate-loading"></div>
    </div>
  );
};

export default Loading;