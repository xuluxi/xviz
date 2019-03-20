import {open, TimeUtil} from 'rosbag';

export async function main() {
  const bagPath = process.argv[2];
  const mainTopic = process.argv[3];

  const bag = await open(bagPath);

  for (let conn in bag.connections) {
    const {topic, type} = bag.connections[conn];
    console.log(topic, type);
  }

  /*
  await bag.readMessages({}, ({topic, message}) => {
    if (!mainTopic || topic === mainTopic) {
      console.log(topic);
      // console.log(JSON.stringify(message, null, 2));
    }
  });
  */
}
