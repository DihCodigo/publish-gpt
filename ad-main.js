document.addEventListener('DOMContentLoaded', function() {
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
        
        sendToAnalytics(logMessage);
        
        storeLocally(logMessage);
    }

    (function() {
        var script = document.createElement('script');
        script.async = true;
        script.src = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';
        document.head.appendChild(script);
        script.onload = function() {
            adUnitIds.forEach(initializeAd);
        };
    })();
    
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
            googletag.cmd.push(function () {
                slot = googletag
                    .defineSlot(
                        "/7542/parceiros/amomeupet",
                        getAdDimensions(adUnitId),
                        adUnitId
                    )
                    .addService(googletag.pubads())
                    .setTargeting("pos", "header");
            });
            console.log(`${adUnitId} Slot Definido: ` + new Date().toLocaleTimeString());
        }

        function displayAd() {
            var googletag = window.googletag || { cmd: [] };
            googletag.cmd.push(function() {
                googletag.enableServices();
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
                    startAdRefresh();
                    displayAd();
                } else {
                    stopAdRefresh();
                }
            });
        });
        observer.observe(adContainer);
    }
    adUnitIds.forEach(initializeAd);
});
