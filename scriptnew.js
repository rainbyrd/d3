const sheets = new Sheets({
    key: '1XupQxIcRUX3tyjTIk72_Vs4WN05VO-edQ-yWqfwXONs',
    query: 'order by A asc'
})
let category = 'gnp'
let bardata = null
let myChart = null
let tooltip = null

sheets.getData(data => {
    bardata = data
    console.log(bardata)
    buildChart()
})

const buildChart = () => {
    category = document.getElementById('category').value
    document.querySelector('span').innerHTML = category.charAt(0).toUpperCase() + category.slice(1)

    //clear out old chart values
    d3.select("svg").remove();
    d3.select("#tip").remove();
    const height = 550,
        width = 800,
        barWidth = 50,
        barOffset = 5,
        maxY = d3.max(bardata.map(unit => {
            return unit[category]
        }));

    var tempColor;
    var colors = d3.scale.linear()
    .domain([0, bardata.length*.33, bardata.length*.66, bardata.length])
    .range(['#FF4E4F','#FFC628', '#22B2A7', '#7B21B2'])

    var yScale = d3.scale.linear()
            .domain([0, maxY])
            .range([0, height]);

    var xScale = d3.scale.ordinal()
            .domain(d3.range(0, bardata.length))
            .rangeBands([55, width])

    tooltip = d3.select('body').append('div')
            .style('position', 'absolute')
            .style('padding', '0 10px')
            .style('background', 'white')
            .style('opacity', 0)
            .attr('id', 'tip')

    myChart = d3.select('#chart').append('svg')
        .style('background', 'linear-gradient(#9baaaa, #fff')
        .style('padding', '10px')
        .style('border', '3px inset white')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .selectAll('rect').data(bardata)
        .enter().append('rect')
            .style('fill', function(d,i) {
                return colors(i);
            })
            .attr('width', xScale.rangeBand())
            .attr('x', function(d,i) {
                return xScale(i);
            })
        .on('mouseover', mouseover)
        .on('mouseout', mouseout)

        var vGuideScale = d3.scale.linear()
            .domain([0, maxY])
            .range([height, 0])

        var vAxis = d3.svg.axis()
            .scale(vGuideScale)
            .orient('left')
            .ticks(10)

        var vGuide = d3.select('svg').append('g')
            vAxis(vGuide)
            vGuide.attr('transform', 'translate(55, 0)')
            vGuide.selectAll('path')
                .style({ fill: 'none', stroke: "#000"})
            vGuide.selectAll('line')
                .style({ stroke: "#000"})

        var hAxis = d3.svg.axis()
            .scale(xScale)
            .orient('bottom')
            .tickValues(xScale.domain().filter(function(d, i) {
                return !(i % (bardata.length/5));
            }))

        var hGuide = d3.select('svg').append('g')
            hAxis(hGuide)
            hGuide.attr('transform', 'translate(0, ' + (height+30) + ')')
            hGuide.selectAll('path')
                .style({ fill: 'none', stroke: "#000"})
            hGuide.selectAll('line')
                .style({ stroke: "#000"})


        myChart.transition()
            .attr('height', function(d, i) {
                return yScale(d[category])
            })
            .attr('y', function(d , i) {
                return height - yScale(d[category])
            })
            .delay(function(d, i) {
                return i * 20;
            })
            .duration(1000)
            .ease('elastic')
}

const mouseover = function (d) {
    tooltip.transition()
        .style('opacity', .9)

    tooltip.html(
        'Year: ' + d.year + '<br>' +
        category.charAt(0).toUpperCase() + category.slice(1)
 + ': ' + d[category]
    ).style('left', (d3.event.pageX - 35) + 'px')
    .style('top',  (d3.event.pageY + 30) + 'px')

    tempColor = this.style.fill;
    d3.select(this)
        .style('opacity', .5)
        .style('fill', '#595AB7')
}

const mouseout = function (d) {
    d3.select(this)
        .style('opacity', 1)
        .style('fill', tempColor)
}
