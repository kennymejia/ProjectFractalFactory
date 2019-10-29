// Heatmap logic
var buildHeatmap = async (datasets) => {
    let aCnt = 0,
        btnLbl = ["All submissions", "Submissions in the last seven days"];
    let margin = {top: 50, right: 0, bottom: 100, left: 30},
        width = 960 - margin.left - margin.right,
        height = 430 - margin.top - margin.bottom,
        gridSize = Math.floor(width / 24),
        legendElementWidth = gridSize * 2,
        buckets = 9,
        colors = ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"], // alternatively colorbrewer.YlGnBu[9]
        days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
        times = ["1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12p"];

    let svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let dayLabels = svg.selectAll(".dayLabel")
        .data(days)
        .enter().append("text")
        .text(function (d) {
            return d;
        })
        .attr("x", 0)
        .attr("y", function (d, i) {
            return i * gridSize;
        })
        .style("text-anchor", "end")
        .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
        .attr("class", function (d, i) {
            return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis");
        });

    let timeLabels = svg.selectAll(".timeLabel")
        .data(times)
        .enter().append("text")
        .text(function (d) {
            return d;
        })
        .attr("x", function (d, i) {
            return i * gridSize;
        })
        .attr("y", 0)
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + gridSize / 2 + ", -6)")
        .attr("class", function (d, i) {
            return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis");
        });


    let heatmapChart = function (data) {

        let colorScale = d3.scale.quantile()
            .domain([0, buckets - 1, d3.max(data, function (d) {
                return d.value;
            })])
            .range(colors);

        let cards = svg.selectAll(".hour")
            .data(data, function (d) {
                return d.day + ':' + d.hour;
            });

        cards.append("title");

        cards.enter().append("rect")
            .attr("x", function (d) {
                return (d.hour - 1) * gridSize;
            })
            .attr("y", function (d) {
                return (d.day - 1) * gridSize;
            })
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("class", "hour bordered")
            .attr("width", gridSize)
            .attr("height", gridSize)
            .style("fill", colors[0]);

        cards.transition().duration(1000)
            .style("fill", function (d) {
                return colorScale(d.value);
            });

        cards.select("title").text(function (d) {
            return d.value;
        });

        cards.exit().remove();

        let legend = svg.selectAll(".legend")
            .data([0].concat(colorScale.quantiles()), function (d) {
                return d;
            });

        legend.enter().append("g")
            .attr("class", "legend");

        legend.append("rect")
            .attr("x", function (d, i) {
                return legendElementWidth * i;
            })
            .attr("y", height)
            .attr("width", legendElementWidth)
            .attr("height", gridSize / 2)
            .style("fill", function (d, i) {
                return colors[i];
            });

        legend.append("text")
            .attr("class", "mono")
            .text(function (d) {
                return "≥ " + Math.round(d);
            })
            .attr("x", function (d, i) {
                return legendElementWidth * i;
            })
            .attr("y", height + gridSize);

        legend.exit().remove();
    };

    heatmapChart(datasets[0]);

    let datasetpicker = d3.select("#dataset-picker").selectAll(".dataset-button")
        .data(datasets);

    datasetpicker.enter()
        .append("input")
        .attr("value", function (d) {
            return btnLbl[aCnt++]
        })
        .attr("type", "button")
        .attr("class", "dataset-button")
        .on("click", function (d) {
            heatmapChart(d);
        });

};

var getDatasets = async () => {
    let response = await fetch('/heatmap');

    if(response.status !== 200){
        console.log(`${response.status} msg: ${response.value}`);
        return;
    }

    let json = await response.json();
    return json;
};

var main = async () => {
    let datasets =  await getDatasets();

    // Only build heatmap if data exists
    if (datasets.length != 0) {
        buildHeatmap(datasets);
    }

};

main();

// Get the modal
var modal = document.getElementById('id01');

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
};


    // Get checkboxes
    let adminChecks = document.getElementsByClassName('adminToggle');
    let activeChecks = document.getElementsByClassName('activeToggle');

    // Set event listeners for toggling admin and active statuses
    let request;
    let response;
    for(let checkbox of adminChecks) {

        checkbox.addEventListener('change', async(e) => {
            request = {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json;charset=UTF-8'
                },
                body: `{"adminStatus": ${e.target.checked},
                        "affectedUserId": "${e.target.parentElement.parentElement.querySelector('.userId').innerHTML}" }`
            };

            response = await fetch('/admin-status', request);

            if(response.status !== 200){
                console.log(`${response.status} msg: ${response.value}`);
            }

        });
    }

    for(let checkbox of activeChecks) {

        checkbox.addEventListener('change', async(e) => {
            request = {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json;charset=UTF-8'
                },
                body: `{"activeStatus": ${e.target.checked},
                        "affectedUserId": "${e.target.parentElement.parentElement.querySelector('.userId').innerHTML}" }`
            };

            response = await fetch('/active-status', request);

            if (response.status !== 200) {
                console.log(`${response.status} msg: ${response.value}`);
            }
        });
    }


// Bootstrap user table logic
$(document).ready(function () {
    $('#userTable').DataTable();
    $('.dataTables_length').addClass('bs-select');
});

// Put name of file that is being uploaded
let input = document.getElementById('fileUpload');
let inputLabel = document.getElementById('fileUploadLabel');

input.addEventListener('change', e => {
    let fileName = input.files[0].name;
    inputLabel.innerHTML = fileName;
});