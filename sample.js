/*
BATCH PROCESSING
Sample code where workers distribute their task based on the queue array
The logic goes each worker gets a job based on the pop array from the queue. 
Then its calling is based on the next function which is recursive approach.
Until there's an item from array, the workers will process as much as possible and it stops 
when array is empty.
*/

const workQueue = [1000,4000,2000,4000,5000,3000,7000,1000,9000,9000,4000,2000,1000,3000,8000,2000,3000,7000,6000,30000];


const Worker = (name) => (channel) => {
	const history = [];
	const next = () => {
    const	job = channel.getWork();
    if (!job) { // All done!
    	console.log('Worker ' + name + ' completed');
      return;
    }
    history.push(job);    
    console.log('Worker ' + name + ' grabbed new job:' + job +'. History is:', history);

    window.setTimeout(next, job); //job is just the milliseconds.
  };
  next();
}

const Channel = (queue) => {
	return { getWork: () => {		
    return queue.pop();
  }};
};

let channel = Channel(workQueue);
let a = Worker('a')(channel);
let b = Worker('b')(channel);
let c = Worker('c')(channel);
let d = Worker('d')(channel);