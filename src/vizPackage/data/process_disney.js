import * as _ from 'lodash';

import * as aesthetics from '../constants/aesthetics';
import disney_data from './disney_payload.json';

disney_data.people_attributes.forEach((person) => { 
	if (person.salary === "") { person.salary = null; }
	else { person.salary = parseInt(person.salary); }
});

// const disney_processed = _(disney_data.people_attributes)
//   .groupBy('age')
//   .map((person, age) => ({
//   	age: age,
//     tenure: _.meanBy(person, 'tenure'),
//     salary: _.meanBy(person, 'salary')
//   }))
//   .value()
//   .filter((d) => { return d.age != 0; });

function groupby_age(data) {
	return _(data)
		  .groupBy('age')
		  .map((people, age) => ({
		  	age: age,
		    tenure: _.meanBy(people, 'tenure'),
		    salary: _.meanBy(people, 'salary'),
		    count: people.length
		  }))
		  .value()
		  .filter((d) => { return d.age != 0; });
}

const disney_female = disney_data.people_attributes.filter((person) => {
	return person.gender === 'female';
});

const disney_male = disney_data.people_attributes.filter((person) => {
	return person.gender === 'male';
});

const disney_processed_female = groupby_age(disney_female);
const disney_processed_male = groupby_age(disney_male);
const disney_processed_all = groupby_age(disney_data.people_attributes);

export default [
	{ 'gender': 'all', 'data': disney_processed_all, 'color': aesthetics.doe_colors.BLUE},
	{ 'gender': 'male', 'data': disney_processed_male, 'color': aesthetics.doe_colors.TURQUOISE},
	{ 'gender': 'female', 'data': disney_processed_female, 'color': aesthetics.doe_colors.MELON},
];
