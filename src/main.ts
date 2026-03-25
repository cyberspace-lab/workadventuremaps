/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from "@workadventure/scripting-api-extra";

console.info('Script started successfully');

let currentPopup: any = undefined;

// Map of area name → { destination, label }
const STAIRS: Record<string, { url: string; label: string; direction: string }> = {
    ExitToPresentationFloor: {
        url: './cyberspacelab_presentation.tmj#start',
        label: 'Presentation Floor',
        direction: '↑ Go up',
    },
    ExitToPosterFloor: {
        url: './cyberspacelab_posters.tmj#start',
        label: 'Poster Floor',
        direction: '↑ Go up',
    },
    ExitToMainFloor: {
        url: './cyberspacelab.tmj#start',
        label: 'Main Floor',
        direction: '↓ Go down',
    },
};

function closePopup() {
    if (currentPopup !== undefined) {
        currentPopup.close();
        currentPopup = undefined;
    }
}

WA.onInit().then(() => {
    console.info('Scripting API ready');
    console.info('Player tags: ', WA.player.tags);

    // ── Staircase / door transitions ──────────────────────────────────────
    for (const [areaName, stair] of Object.entries(STAIRS)) {
        WA.room.area.onEnter(areaName).subscribe(() => {
            closePopup();
            currentPopup = WA.ui.openPopup(
                'stairsPopup',
                `🚪 ${stair.label} — use the stairs?`,
                [
                    {
                        label: stair.direction,
                        className: 'success',
                        callback: (popup) => {
                            popup.close();
                            currentPopup = undefined;
                            WA.nav.goToRoom(stair.url);
                        },
                    },
                    {
                        label: 'Stay',
                        className: 'normal',
                        callback: (popup) => {
                            popup.close();
                            currentPopup = undefined;
                        },
                    },
                ]
            );
        });

        WA.room.area.onLeave(areaName).subscribe(closePopup);
    }

    // ── Clock area (existing feature) ─────────────────────────────────────
    WA.room.area.onEnter('clock').subscribe(() => {
        const today = new Date();
        const time = today.getHours() + ':' + today.getMinutes();
        currentPopup = WA.ui.openPopup('clockPopup', "It's " + time, []);
    });

    WA.room.area.onLeave('clock').subscribe(closePopup);

    // ── Scripting API Extra ────────────────────────────────────────────────
    bootstrapExtra().then(() => {
        console.info('Scripting API Extra ready');
    }).catch(e => console.error(e));

}).catch(e => console.error(e));

export {};
