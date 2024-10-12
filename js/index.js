// Header
const header = document.getElementById('js-header');
const mobMenu = document.getElementById('js-mobile-menu');
const burger = document.querySelector('.js-toggle-mob-menu');
let isMenuOpened = false;
let isQuoteLoading = false;
const banner = document.getElementById('js-banner');


// Try API
const tryAPI = document.getElementById('js-try-api');
let isInViewport = false;
let cacheQuote;

const currentYear = document.getElementById('js-current-year');

function openMobMenu() {
    mobMenu.classList.add('active');
    header.classList.add('menu-active');
    document.body.classList.add('mob-menu-active');
    document.body.style.overflow = 'hidden';
    isMenuOpened = true;
}
function closeMobMenu() {
    mobMenu.classList.remove('active');
    header.classList.remove('menu-active');
    document.body.classList.remove('mob-menu-active');
    document.body.style.overflow = '';
    isMenuOpened = false;
}
function initFullpage() {
    if (!document.getElementById('fullpage')) {
        return
    }
    var myFullpage = new fullpage('#fullpage', {
        credits: {
            enabled: false,
            label: ' ',
        },
        onLeave: function(origin, destination, direction){
            var elements = destination.item.querySelectorAll('.fp-animate');
            elements.forEach(function(element) {
                setTimeout(()=> {
                    element.classList.add('animate__animated');
                    element.classList.add('animate__fadeInUp');
                }, 400);
            });
            if (destination?.index !== 0) {
                header.classList.add('sticky');
            } else {
                header.classList.remove('sticky');
            }
        },
    });
}
function initBrandCarousel() {
    if (document.querySelector('#js-brand-carousel')) {
        const brandSlider = $("#js-brand-carousel").slick({
            slidesToShow: 7,
            slidesToScroll: 7,
            autoplay: false,
            infinite: true,
            dots: true,
            arrows: false,
            speed: 2000,
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 6,
                        slidesToScroll: 6,
                    }
                },
                {
                    breakpoint: 992,
                    settings: {
                        slidesToShow: 5,
                        slidesToScroll: 5,
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3,
                    }
                }
            ]
        });
    }
}

async function quoteForCreationOrderParams(
    srcChainId,
    srcChainTokenIn,
    srcChainTokenInAmount,
    dstChainId,
    dstChainTokenOut,
    dstChainTokenOutAmount,
    affiliateFeePercent = undefined,
    affiliateFeeRecipient = undefined,
    prependOperatingExpenses = false
) {
    if (!cacheQuote) {
        const url = 'https://dln.debridge.finance/v1.0/dln/quote?';
        const params = new URLSearchParams();
        if (!srcChainId || !srcChainTokenIn || !srcChainTokenInAmount || !dstChainId || !dstChainTokenOut) {
            throw new Error("Required parameters are missing.");
        }
        params.append("srcChainId", srcChainId);
        params.append("srcChainTokenIn", srcChainTokenIn);
        params.append("srcChainTokenInAmount", srcChainTokenInAmount);
        params.append("dstChainId", dstChainId);
        params.append("dstChainTokenOut", dstChainTokenOut);
        if (dstChainTokenOutAmount !== null && dstChainTokenOutAmount !== undefined) {
            params.append("dstChainTokenOutAmount", dstChainTokenOutAmount);
        }
        if (affiliateFeePercent !== undefined && affiliateFeePercent !== null) {
            params.append("affiliateFeePercent", affiliateFeePercent);
        }
        if (affiliateFeeRecipient !== undefined && affiliateFeeRecipient !== null) {
            params.append("affiliateFeeRecipient", affiliateFeeRecipient);
        }
        params.append("prependOperatingExpenses", prependOperatingExpenses);
        const response = await fetch(`${url}${params.toString()}`);
        cacheQuote = await readResponse(response);
    }
    return cacheQuote;
}
async function showTryApiResult() {
    if (isQuoteLoading) {
        return;
    }
    isQuoteLoading = true;
    const animationEl = document.getElementById('js-try-api-animation');
    animationEl.classList.remove('in-progress');
    try {
        const srcChainId = 1;
        const srcChainTokenIn = '0x0000000000000000000000000000000000000000';
        const srcChainTokenInAmount = '1000000000000000000';
        const dstChainId = 56;
        const dstChainTokenOut = '0x0000000000000000000000000000000000000000';
        const dstChainTokenOutAmount = '0';
        const prependOperatingExpenses = true;

        const result = await quoteForCreationOrderParams(
            srcChainId,
            srcChainTokenIn,
            srcChainTokenInAmount,
            dstChainId,
            dstChainTokenOut,
            dstChainTokenOutAmount,
            null,
            null,
            prependOperatingExpenses
        );
        if (result) {
            const recommendedOutput = result?.estimation?.dstChainTokenOut?.recommendedAmount;
            const resultOutput = document.getElementById('js-api-result-output');
            const resultAll = document.getElementById('js-api-all-result');

            if (resultOutput && recommendedOutput) {
                resultOutput.innerText = Number(recommendedOutput) / (10 ** 18);
            }
            if (resultAll) {
                resultAll.innerText = JSON.stringify(result, null, 2);
            }
        }
        setTimeout(() => {
            isQuoteLoading = false;
        }, 6000);
        setTimeout(() => {
            animationEl.classList.add('in-progress');
        }, 1000);
    } catch (e) {
        console.error(e);
        isQuoteLoading = false;
    }
}
async function getBanner() {
    const url = 'https://dln-api.debridge.finance/api/AnnouncementBanner/getBannerByDomain?';
    const params = new URLSearchParams();
    params.append("domain", 'debridge.finance');
    const response = await fetch(`${url}${params.toString()}`);
    return await readResponse(response)
}
async function getAllTimeStatistic() {
    const url = 'https://points-api.debridge.finance/api/Statistics/getAllTime';
    const response = await fetch(url);
    return await readResponse(response)
}
async function readResponse(response) {
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
    return await response.json();
}

const abbreviateNumber = n => {
    let value = n;
    let abr = '';
    if (n >= 1e3 && n < 1e6) {
        value = Number(n / 1e3).toFixed(1);
        abr = 'Thousand'
    }
    if (n >= 1e6 && n < 1e9) {
        value = Number(n / 1e6).toFixed(1);
        abr = 'Million';
    }
    if (n >= 1e9 && n < 1e12) {
        value = Number(n / 1e9).toFixed(1);
        abr = 'Billion';
    }
    if (n >= 1e12) {
        value = Number(n / 1e3).toFixed(1);
        abr = 'Trillion'
    }
    return { value, abr }
};

if (burger) {
    burger.onclick = function(e){
        if (isMenuOpened) {
            closeMobMenu();
        } else {
            openMobMenu();
        }
    }
}
async function updateVolume() {
    const volumeValElement = document.getElementById('js-total-volume');
    const volumeValSupElement = document.getElementById('js-total-volume-sup');
    if (volumeValElement) {
        try {
            const allStat = await getAllTimeStatistic();
            if (allStat?.totalTradedVolumeUSD) {
                const shortValue = abbreviateNumber(allStat?.totalTradedVolumeUSD);
                if (shortValue?.value) {
                    volumeValElement.innerText = shortValue.value.replace('.', ',');
                    volumeValSupElement.innerText = shortValue.abr;
                }
            }
        } catch (e) {
            console.error('getAllTimeStatistic::catch', e);
        }
    }
}
function setWindowHeightVar() {
    document.body.style.setProperty('--app-height', window.innerHeight + 'px');
}
onresize = (event) => {
    setWindowHeightVar();
    document.body.style.setProperty('--notifications-height', (banner?.clientHeight || 0) + 'px');
};
document.addEventListener('DOMContentLoaded', function () {
    setWindowHeightVar();
    if (currentYear) {
        currentYear.innerText = new Date().getFullYear();
    }
    getBanner()
        .then((response) => {
            if (response?.message) {
                document.body.classList.add('has-banner');
                document.body.style.setProperty('--bannerTextColorDark', response?.textColorDark);
                document.body.style.setProperty('--bannerTextColorLight', response?.textColorLight);
                document.body.style.setProperty('--bannerColorDark', response?.bannerColorDark);
                document.body.style.setProperty('--bannerColorLight', response?.bannerColorLight);
                banner.innerHTML = response.message;
                document.body.style.setProperty('--notifications-height', (banner?.clientHeight || 0) + 'px');
            }
        })
        .catch((err) => {
            console.error(err);
        });
    initBrandCarousel();
    // Init wow animation
    new WOW().init();
    setSticky();
    updateVolume();
});

function setSticky(){
    const scrollPoint = banner?.clientHeight ? 30 : 1;
    if (window.scrollY >= scrollPoint) {
        header.classList.add('sticky');
    } else {
        header.classList.remove('sticky');
    }
}
window.addEventListener('scroll', function(){
    // Sticky header
    setSticky();
    // Try api
    if (tryAPI && tryAPI.getBoundingClientRect().top < window.innerHeight && !isInViewport) {
        isInViewport = true;
        showTryApiResult();
    }
});
