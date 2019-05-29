import * as _ from 'lodash';
import disney_data from './disney_payload.json';

disney_data.people_attributes.forEach((person) => { 
	if (person.salary === "") { person.salary = null; }
	else { person.salary = parseInt(person.salary); }
});

const disney_processed = _(disney_data.people_attributes)
  .groupBy('age')
  .map((person, age) => ({
  	age: age,
    tenure: _.meanBy(person, 'tenure'),
    salary: _.meanBy(person, 'salary')
  }))
  .value()
  .filter((d) => { return d.age != 0; });

export default disney_processed;