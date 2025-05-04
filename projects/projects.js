import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);


// let rolledData = d3.rollups(
//     projects,
//     (v) => v.length,
//     (d) => d.year,
//     );
//     let data = rolledData.map(([year, count]) => {
//         return { value: count, label: year };
//     });

//     let sliceGenerator = d3.pie().value((d) => d.value);
//     let arcData = sliceGenerator(data);
//     let arcs = arcData.map((d) => arcGenerator(d));

//     let colors = d3.scaleOrdinal(d3.schemeTableau10);
//     arcs.forEach((arc, idx) => {
//         d3.select('svg')
//         .append('path')
//         .attr('d', arc)
//         .attr('fill', colors(idx)) // Fill in the attribute for fill color via indexing the colors variable
//     })
//     let legend = d3.select('.legend');
//     data.forEach((d, idx) => {
//     legend
//         .append('li')
//         .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
//         .attr('class', 'legends')
//         .html(`<span class="swatch" style="background-color: ${colors(idx)}"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
// });

function renderPieChart(projectsGiven) {
    let newRolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year,
    );
    let svg = d3.select('svg');
    svg.selectAll('path').remove(); 
    let legend = d3.select('.legend');
    legend.selectAll('li').remove();  

    let newData = newRolledData.map(([year, count]) => {
        return { value: count, label: year };
    });
    let newSliceGenerator = d3.pie().value((d) => d.value);
    let newArcData = newSliceGenerator(newData);
    let newArcs = newArcData.map((d) => arcGenerator(d));
    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    let selectedIndex = -1
    const years = Array.from(new Set(newData.map(project => project.label)));
    
    newArcs.forEach((arc, idx) => {
        d3.select('svg')
        .append('path')
        .attr('d', arc)
        .attr('fill', colors(idx)) 
        .on('click', () => {
            selectedIndex = selectedIndex === idx ? -1 : idx;
            svg
                .selectAll('path')
                .attr('class', (_, idx) => (
                    idx === selectedIndex ? 'selected' : ''
                ));
            legend
                .selectAll('li')
                .attr('class', (_, idx) => (
                    idx === selectedIndex ? 'legends selected' : 'legends' 
                ))
            
            if (selectedIndex === -1) {
                renderProjects(projectsGiven, projectsContainer, 'h2');
            } 
            else {
                let filteredProjects = projectsGiven.filter((project) => {
                    return project.year === years[selectedIndex]
                });
                renderProjects(filteredProjects, projectsContainer, 'h2');
            }
        });
    })
    newData.forEach((d, idx) => {
    legend
        .append('li')
        .attr('style', `--color:${colors(idx)}`) 
        .attr('class', 'legends')
        .html(`<span class="swatch" style="background-color: ${colors(idx)}"></span> ${d.label} <em>(${d.value})</em>`)
    });

}

renderPieChart(projects);


let query = '';
let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('change', (event) => {
 
  query = event.target.value;
  
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
 
  renderProjects(filteredProjects, projectsContainer, 'h2');
  let newSVG = d3.select('svg');
  newSVG.selectAll('path').remove();
  renderPieChart(filteredProjects);
});
