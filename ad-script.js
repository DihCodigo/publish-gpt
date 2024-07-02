const adUnitIds = [
    "r7_header", "r7_texto_1", "r7_texto_2", "r7_texto_3", "r7_texto_4", "r7_retangulo_lateral_1", 
    "r7_retangulo_lateral_2", "r7_retangulo_lateral_3", "r7_sticky_lateral", "r7_stickybottom"
];

const refreshRate = 10000;

const dimensions = {
    r7_header: { mobile: [[320, 50]], desktop: [[970, 250]] },
    r7_texto_1: { mobile: [[320, 50]], desktop: [[728, 90]] },
    r7_texto_2: { mobile: [[300, 250]], desktop: [[300, 250]] },
    r7_texto_3: { mobile: [[300, 250]], desktop: [[300, 250]] },
    r7_texto_4: { mobile: [[300, 250]], desktop: [[300, 250]] },
    r7_retangulo_lateral_1: { mobile: [[300, 250]], desktop: [[300, 250]] },
    r7_retangulo_lateral_2: { mobile: [[300, 250]], desktop: [[300, 250]] },
    r7_retangulo_lateral_3: { mobile: [[300, 250]], desktop: [[300, 250]] },
    r7_sticky_lateral: { mobile: [[300, 250]], desktop: [[300, 600]] },
    r7_stickybottom: { mobile: [[320, 50]], desktop: [[728, 90]] }
};

function getAdDimensions(adUnitId) {
    const isDesktop = window.innerWidth > 728;
    return isDesktop ? dimensions[adUnitId].desktop : dimensions[adUnitId].mobile;
}

function trackViewability(adUnitId, isIntersecting) {
    const timestamp = new Date().toISOString();
    const viewportSize = `${window.innerWidth}x${window.innerHeight}`;
    const visibilityStatus = isIntersecting ? 'Visible' : 'Not Visible';
    const logMessage = `Viewability - AdUnit: ${adUnitId}, Status: ${visibilityStatus}, Timestamp: ${timestamp}, Viewport Size: ${viewportSize}`;
    
    console.log(logMessage);
    
    sendToAnalytics(adUnitId, isIntersecting);
    storeLocally(logMessage);
}

function sendToAnalytics(adUnitId, isIntersecting) {
    const eventData = {
        adUnitId: adUnitId,
        event_category: 'Ad Viewability',
        event_value: isIntersecting ? 1 : 0,
    };

    gtag('event', 'ad_viewability', {
        event_category: 'Ad Viewability',
        value: eventData.event_value,
        ad_unit_id: adUnitId,
        visibility_status: isIntersecting ? 'Visible' : 'Not Visible',
    });

    console.log('Dados enviados para análise:', eventData);
}

(function() {
    const analyticsCode = getAnalyticsCode(window.location.href);
    console.log("~~ Analytics Code " + analyticsCode);

    var script1 = document.createElement('script');
    script1.async = true;
    script1.src = 'https://www.googletagmanager.com/gtag/js?id=`${analyticsCode}`';
    document.head.appendChild(script1);

    script1.onload = function() {
        window.dataLayer = window.dataLayer || [];
        function gtag() {
            dataLayer.push(arguments);
        }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', `${analyticsCode}`);

        var script2 = document.createElement('script');
        script2.async = true;
        script2.src = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';
        document.head.appendChild(script2);

        script2.onload = function() {
            var googletag = window.googletag || { cmd: [] };
            googletag.cmd.push(function() {
                adUnitIds.forEach(initializeAd);
                googletag.enableServices();
            });
        };
    };
})();

function storeLocally(data) {
    localStorage.setItem('viewabilityLog', data);
}

function initializeAd(adUnitId) {
    const adContainer = document.getElementById(adUnitId);
    if (!adContainer) {
        return;
    }

    let adRefreshInterval;
    let debugInterval;
    let elapsedSeconds = 0;
    let slot;

    function defineAdSlot() {
        var googletag = window.googletag || { cmd: [] };
        var adUnitPath = getAdUnitPath(window.location.href);
        googletag.cmd.push(function () {
            slot = googletag
                .defineSlot(
                    adUnitPath,
                    getAdDimensions(adUnitId),
                    adUnitId
                )
                .addService(googletag.pubads())
                .setTargeting("pos", "header")
                .setTargeting("visible", "Not Visible");
        });
        console.log(`${adUnitId} Slot Definido: ` + new Date().toLocaleTimeString());
    }

    function displayAd() {
        var googletag = window.googletag || { cmd: [] };
        googletag.cmd.push(function() {
            googletag.display(adUnitId);
        });
        console.log(`${adUnitId} Exibido: ` + new Date().toLocaleTimeString());
    }

    function refreshAd() {
        var googletag = window.googletag || { cmd: [] };
        googletag.cmd.push(function() {
            googletag.pubads().refresh([slot]);
            console.log(`${adUnitId} Atualizado: ` + new Date().toLocaleTimeString());
        });
    }

    function startAdRefresh() {
        if (!adRefreshInterval) {
            adRefreshInterval = setInterval(refreshAd, refreshRate);
        }
        if (!debugInterval) {
            debugInterval = setInterval(() => {
                elapsedSeconds++;
                //console.log(`${adUnitId} - Segundos: ` + elapsedSeconds);
            }, 1000);
        }
    }

    function stopAdRefresh() {
        if (adRefreshInterval) {
            clearInterval(adRefreshInterval);
            adRefreshInterval = null;
        }
        if (debugInterval) {
            clearInterval(debugInterval);
            debugInterval = null;
        }
        elapsedSeconds = 0;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            trackViewability(adUnitId, entry.isIntersecting);
            if (entry.isIntersecting) {
                adContainer.style.display = 'block';
                if (!slot) {
                    defineAdSlot();
                }
                googletag.cmd.push(function() {
                    slot.setTargeting("visible", "Visible");
                    googletag.pubads().refresh([slot]);
                });
                startAdRefresh();
                displayAd();
            } else {
                googletag.cmd.push(function() {
                    slot.setTargeting("visible", "Not Visible");
                    googletag.pubads().refresh([slot]);
                });
                stopAdRefresh();
            }
        });
    });
    observer.observe(adContainer);
}

function getAdUnitPath(url) {
    if (url.includes("overplay.com.br")) {
        return "/7542/parceiros/overplay";
    } else if (url.includes("www.amomeupet.org")) {
        return "/7542/parceiros/amomeupet";
    } else if (url.includes("diarural.com.br")) {
        return "/7542/parceiros/diarural";
    } else if (url.includes("www.efarsas.com")) {
        return "/7542/parceiros/efarsas";
    } else if (url.includes("www.newsmotor.com.br")) {
        return "/7542/parceiros/NewsMotor";
    } else if (url.includes("belezademulher.com.br")) {
        return "/7542/parceiros/BelezaDeMulher";
    } else if (url.includes("dihcodigo.github.io")) {
        return "/7542/parceiros/dihcodigo";
    } else {
        return "/7542/parceiros/default";
    }
}



function getAnalyticsCode(url) {
    if (url.includes("overplay.com.br")) {
        return "G-XXXXXXXXXX";
    } else if (url.includes("www.amomeupet.org")) {
        return "G-YYYYYYYYYY";
    } else if (url.includes("diarural.com.br")) {
        return "G-ZZZZZZZZZZ";
    } else if (url.includes("www.efarsas.com")) {
        return "G-AAAAAAAAAA";
    } else if (url.includes("www.newsmotor.com.br")) {
        return "G-BBBBBBBBBB";
    } else if (url.includes("belezademulher.com.br")) {
        return "G-CCCCCCCCCC";
    } else if (url.includes("dihcodigo.github.io")) {
        return "G-JR6H1X3BNK";
    } else {
        return "G-CODE";
    }
}
