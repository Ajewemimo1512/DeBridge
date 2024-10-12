const supportedAppChains = {
    "1": {
        "name": "Ethereum",
        "chainId": 1,
        "color": "#5AACEE",
        "img": "/assets/img/chain/eth.svg",
    },
    "10": {
        "name": "Optimism",
        "chainId": 10,
        "color": "#EA3431",
        "img": "/assets/img/chain/optimism.svg",
    },
    "56": {
        "name": "BNB Chain",
        "chainId": 56,
        "color": "#F5BFBF",
        "img": "/assets/img/chain/bnb.svg",
    },
    "128": {
        "name": "Heco",
        "chainId": 128,
        "color": "#4FC17D",
        "img": "/assets/img/chain/heco.svg",
    },
    "137": {
        "name": "Polygon",
        "chainId": 137,
        "color": "#6D55A0",
        "img": "/assets/img/chain/polygon.svg",
    },
    "250": {
        "name": "Fantom",
        "chainId": 250,
        "color": "#02759B",
        "img": "/assets/img/chain/fantom.svg",
    },
    "8453": {
        "name": "Base",
        "chainId": 8453,
        "color": "#2151F5",
        "img": "/assets/img/chain/base.svg",
    },
    "42161": {
        "name": "Arbitrum",
        "chainId": 42161,
        "color": "#CF7E4D",
        "img": "/assets/img/chain/arbitrum.svg",
    },
    "43114": {
        "name": "Avalanche",
        "chainId": 43114,
        "color": "#BC3B4D",
        "img": "/assets/img/chain/avalanche.svg",
    },
    "59144": {
        "name": "Linea",
        "chainId": 59144,
        "color": "#81CFFA",
        "img": "/assets/img/chain/linea.svg",
    },
    "7565164": {
        "name": "Solana",
        "chainId": 7565164,
        "color": "#CA36F6",
        "img": "/assets/img/chain/solana.svg",
    },
    "100000001": {
        "name": "Neon",
        "chainId": 245022934,
        "subscriptionId": "100000001",
        "color": "#70ED9D",
        "img": "/assets/img/chain/neon.svg",
    },
    "100000002": {
        "name": "Gnosis",
        "chainId": 100,
        "subscriptionId": "100000002",
        "color": "#0d8e74",
        "img": "/assets/img/chain/gnosis.svg",
    },
    // "100000003": {
    //     "name": "LightLink",
    //     "chainId": 1890,
    //     "subscriptionId": "100000003",
    //     "color": "#6978FF",
    //     "img": "/assets/img/chain/lightlink.svg",
    // },
    // "100000004": {
    //     "name": "Metis",
    //     "chainId": 1088,
    //     "subscriptionId": "100000004",
    //     "color": "#00D2FF",
    //     "img": "/assets/img/chain/metis.svg",
    // }
};
const options = {
    maintainAspectRatio: false,
    layout: {
        padding:{top:4,left:0,right:4,bottom:4}
    },
    plugins: {
        htmlLegend: {
            display: true
        },
        tooltip: {
            caretSize: 0,
            yAlign: 'bottom',
            xAlign: 'left',
            displayColors: false,
            bodyFont: {
                size: 11,
            },
            titleFont: {
                size: 11,
            },
            footerFont: {
                size: 11,
            },
            borderWidth: 0,
            padding: 10,
            backgroundColor: '#03111C',
            bodyColor: '#B6BBB4',
            titleColor: '#B6BBB4',
            footerColor: '#B6BBB4',
            bodySpacing: 3,
            boxWidth: 8,
            boxHeight: 8,
            boxPadding: 8,
            callbacks: {
                label: function (context) {
                    const item = context.dataset.data[context.dataIndex];
                    return item.fromLabel + ' to ' + item.toLabel + ': $' + Number(item.flow).toLocaleString('en-US');
                }
            }
        }
    }
};
async function getDailyStatistics(dateFrom, dateTo) {
    if (!cacheQuote) {
        let url_ = 'https://stats-api.dln.trade/api/Satistics/getDaily?';
        if (dateFrom === null)
            throw new Error("The parameter 'dateFrom' cannot be null.");
        else if (dateFrom !== undefined)
            url_ += "dateFrom=" + encodeURIComponent(dateFrom ? "" + dateFrom : "") + "&";
        if (dateTo === null)
            throw new Error("The parameter 'dateTo' cannot be null.");
        else if (dateTo !== undefined)
            url_ += "dateTo=" + encodeURIComponent(dateTo ? "" + dateTo : "") + "&";
        url_ = url_.replace(/[?&]$/, "");

        const params = new URLSearchParams();
        const response = await fetch(`${url_}${params.toString()}`);
        if (!response.ok) {
            const errorResponse = await response.json();
            if (errorResponse?.error?.text) {
                throw new Error(errorResponse.error.text);
            } else if (errorResponse && errorResponse.error) {
                throw {
                    errorType: errorResponse?.error?.errorCode,
                    ...errorResponse?.error,
                };
            } else {
                throw new Error("An error occurred while making the request.");
            }
        }
        cacheQuote = await response.json();
    }
    return cacheQuote;
}
function getDlnLatestDayCumulative(data) {
    if (!data?.length) { return null; }
    const maxDate = Math.max(...data.map((item) => item.date));
    return data.filter((item) =>
        item.date === maxDate
        && item.totalAmountGivenUsd !== 0
        && item.totalAmountTakenUsd !== 0
        && supportedAppChains[item.giveChainId.bigIntegerValue]
        && supportedAppChains[item.takeChainId.bigIntegerValue]
    );
}
function getSankeyDataset(data) {
    const labelsObject = {};
    allFilters = { from: [], to: [] };
    for (const chainId in supportedAppChains) {
        if (supportedAppChains.hasOwnProperty(chainId)) {
            allFilters.from.push('from_' + chainId);
            allFilters.to.push('to_' + chainId);
            labelsObject['from_' + chainId] = supportedAppChains[chainId].name;
            labelsObject['to_' + chainId] = supportedAppChains[chainId].name;
        }
    }
    return {
        label: '',
        colorMode: 'gradient',
        data: data.map((item) => {
            const from = supportedAppChains[item.giveChainId.bigIntegerValue];
            const to = supportedAppChains[item.takeChainId.bigIntegerValue];
            return {
                from: 'from_' + (from?.subscriptionId || from?.chainId),
                to: 'to_' + (to?.subscriptionId || to?.chainId),
                flow: item.totalAmountGivenUsd,
                fromColor: from?.color,
                toColor: to?.color,
                fromLabel: from?.name,
                toLabel: to?.name,
            };
        }),
        labels: labelsObject,
        size: 'max',
        colorFrom: (c) => c.dataset.data[c.dataIndex]?.fromColor,
        colorTo: (c) => c.dataset.data[c.dataIndex]?.toColor,
        color: '#FFFFFF',
        borderWidth: 0,
        nodeWidth: 4,
    };
}

// Filter
let activeFilters = [];
function createFilterList(chains) {
    const chainList = document.createElement('ul');
    chains.sort((a, b) => a.labelText.localeCompare(b.labelText)).forEach(item => {
        const li = document.createElement('li');
        const button = document.createElement('button');
        button.type = 'button';
        button.onclick = (event) => filterByChain(event, item.index, item.chainId);

        const spanPoint = document.createElement('span');
        spanPoint.className = 'chart-legend-item-point';
        spanPoint.style.color = item.bgColor;

        const spanText = document.createElement('span');
        spanText.className = 'chart-legend-item-text';
        spanText.textContent = item.labelText;

        button.appendChild(spanPoint);
        button.appendChild(spanText);
        li.appendChild(button);
        chainList.appendChild(li);
    })

    return chainList;
}
function addFilterControls(chart) {
    let customLegend = {
        from: [],
        to: []
    };
    if (chart?.data?.datasets[0]) {
        chart.data.datasets[0].data.forEach((item, index) => {
            if (!customLegend.from.find(i => i.chainId === item.from)) {
                customLegend.from.push({
                    index,
                    labelText: item.fromLabel,
                    bgColor: item.fromColor,
                    chainId: item.from
                });
            }
            if (!customLegend.to.find(i => i.chainId === item.to)) {
                customLegend.to.push({
                    index,
                    labelText: item.toLabel,
                    bgColor: item.toColor,
                    chainId: item.to
                });
            }
        });
        const fromContainer = document.getElementById('js-sankey-from');
        fromContainer.prepend(createFilterList(customLegend.from))

        const toContainer = document.getElementById('js-sankey-to');
        toContainer.prepend(createFilterList(customLegend.to));
    }
}

function updateAllChainsBtnState(container) {
    const offAllButton = container.querySelector('.js-sankey-all');
    if (container.querySelector('.filtered')) {
        offAllButton.classList.add('has-filter');
    } else {
        offAllButton.classList.remove('has-filter');
    }
}

function toggleFilterBtn(isActive, id) {
    if (isActive) {
        activeFilters.push(id);
    } else {
        const indexToRemove = activeFilters.indexOf(id);
        if (indexToRemove !== -1) {
           activeFilters.splice(indexToRemove, 1);
        }
    }
}

function toggleAllChainsBtn(isFrom = true) {
    const filterList = document.getElementById(isFrom ? 'js-sankey-from' : 'js-sankey-to');
    const isFiltered = filterList.getElementsByClassName('filtered')?.length;
    const btns = filterList.getElementsByTagName('button');
    if (isFiltered) {
        activeFilters = activeFilters.filter(i => !i.includes(isFrom ? 'from' : 'to'));
        for (let btn of Array.from(btns)) {
            btn.classList.remove('filtered');
        }
    } else {
        activeFilters = [...activeFilters, ...(isFrom ? allFilters.from : allFilters.to)]
        for (let btn of Array.from(btns)) {
            btn.classList.add('filtered');
        }
    }
    updateChartData();
    updateAllChainsBtnState(filterList);
}

function filterByChain(event, index, chainId) {
    let target = (event.target || event.currentTarget);
    if (target.tagName !== 'button') {
        target = target.closest('button');
    }
    target.classList.toggle('filtered');
    // Sankey cannot filter through standard chart functions. Filter manually
    this.toggleFilterBtn(target.classList.contains('filtered'), chainId);

    const container = target.closest('.js-sankey-filter-list');
    updateAllChainsBtnState(container);
    updateChartData();
}

function updateChartData() {
    const sankeyDataset = getSankeyDataset(statisticData);
    sankeyDataset.data = sankeyDataset.data.filter((item) => {
        const isFromInFilters = activeFilters.find(filter => filter === item.from);
        const isToInFilters = activeFilters.find(filter => filter === item.to);
        return !isFromInFilters && !isToInFilters;
    });
    chart.data = {
        datasets: [sankeyDataset],
    };
    chart.update();
}

let chart;
let statisticData;
let allFilters = {
    from: [],
    to: []
};
async function initSankeyGraph() {
    try {
        const ctx = document.getElementById('js-sankey');
        if (!ctx) {
            return;
        }
        const dailyData = await getDailyStatistics(
            '2024-04-27T00:00:00.000Z',
            '2024-05-26T00:00:00.000Z'
        );
        statisticData = getDlnLatestDayCumulative(dailyData?.dailyDataCumulative);
        if (statisticData) {
            const data = {
                datasets: [getSankeyDataset(statisticData)],
            };
            chart = new Chart(ctx, {
                type: 'sankey',
                data,
                options,
            });
            addFilterControls(chart, ctx);
        }
    } catch (e) {
        console.error('updateSankeyGraph::catch', e)
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initSankeyGraph();
});
