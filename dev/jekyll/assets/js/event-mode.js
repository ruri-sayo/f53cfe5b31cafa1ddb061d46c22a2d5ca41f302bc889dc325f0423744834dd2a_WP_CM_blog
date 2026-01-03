/**
 * イベントモード管理
 * 日付に応じて自動的にイベントテーマを適用
 * デバッグコマンド: window.setEvent('christmas') で手動切り替え可能
 */
(function () {
    'use strict';

    // イベントデータ（Jekyll から埋め込み、またはここで定義）
    const EVENTS = window.SHIROGAMI_EVENTS || [];

    /**
     * 現在の日付がイベント期間内かチェック
     */
    function isEventActive(event, now) {
        const month = now.getMonth() + 1;
        const day = now.getDate();

        const startMonth = event.start_month;
        const startDay = event.start_day;
        const endMonth = event.end_month;
        const endDay = event.end_day;

        // 同月内のイベント
        if (startMonth === endMonth) {
            return month === startMonth && day >= startDay && day <= endDay;
        }

        // 月をまたぐイベント（年末年始など）
        if (startMonth > endMonth) {
            // 12月開始、1月終了のような場合
            return (month === startMonth && day >= startDay) ||
                (month === endMonth && day <= endDay) ||
                (month > startMonth || month < endMonth);
        }

        // 通常の複数月イベント
        return (month === startMonth && day >= startDay) ||
            (month === endMonth && day <= endDay) ||
            (month > startMonth && month < endMonth);
    }

    /**
     * 現在アクティブなイベントを取得
     */
    function getCurrentEvent() {
        const now = new Date();
        return EVENTS.find(event => isEventActive(event, now)) || null;
    }

    /**
     * イベントテーマを適用
     */
    function applyEventTheme(event) {
        if (!event) {
            removeEventTheme();
            return;
        }

        const body = document.body;
        const header = document.querySelector('header');
        const footer = document.querySelector('footer');

        // 既存のイベントクラスを削除
        body.className = body.className.replace(/event-\S+/g, '').trim();

        // イベントクラスを追加
        body.classList.add('event-active');
        body.classList.add('event-' + event.id);

        // 背景色を適用
        if (event.bg_color) {
            body.style.setProperty('--event-bg-color', event.bg_color);
            body.style.backgroundColor = event.bg_color;
        }

        // ヘッダー/フッターカラーを適用
        if (event.header_color && header) {
            header.style.backgroundColor = event.header_color;
        }
        if (event.header_color && footer) {
            footer.style.backgroundColor = event.header_color;
        }

        // イベントバナーを表示
        showEventBanner(event);

        console.log('[EventMode] Applied:', event.name, '(' + event.id + ')');
    }

    /**
     * イベントテーマを削除
     */
    function removeEventTheme() {
        const body = document.body;
        const header = document.querySelector('header');
        const footer = document.querySelector('footer');

        body.className = body.className.replace(/event-\S+/g, '').trim();
        body.classList.remove('event-active');
        body.style.removeProperty('--event-bg-color');
        body.style.backgroundColor = '';

        if (header) header.style.backgroundColor = '';
        if (footer) footer.style.backgroundColor = '';

        hideEventBanner();
        console.log('[EventMode] Theme removed');
    }

    /**
     * イベントバナーを表示
     */
    function showEventBanner(event) {
        let banner = document.getElementById('event-banner');

        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'event-banner';
            banner.className = 'event-banner';
            document.body.insertBefore(banner, document.body.firstChild);
        }

        banner.innerHTML = `
      <span class="event-emoji">${event.emoji || '🎉'}</span>
      <span class="event-name">${event.name}</span>
      <span class="event-emoji">${event.emoji || '🎉'}</span>
    `;
        banner.style.display = 'flex';
    }

    /**
     * イベントバナーを非表示
     */
    function hideEventBanner() {
        const banner = document.getElementById('event-banner');
        if (banner) {
            banner.style.display = 'none';
        }
    }

    /**
     * デバッグ用：手動でイベントを設定
     * 使用例: window.setEvent('christmas')
     */
    window.setEvent = function (eventId) {
        if (!eventId) {
            removeEventTheme();
            console.log('[EventMode] Debug: Event cleared');
            return;
        }

        const event = EVENTS.find(e => e.id === eventId);
        if (event) {
            applyEventTheme(event);
            console.log('[EventMode] Debug: Manually set to', event.name);
        } else {
            console.warn('[EventMode] Event not found:', eventId);
            console.log('[EventMode] Available events:', EVENTS.map(e => e.id).join(', '));
        }
    };

    /**
     * デバッグ用：利用可能なイベント一覧を表示
     */
    window.listEvents = function () {
        console.log('[EventMode] Available events:');
        EVENTS.forEach(e => {
            console.log(`  - ${e.id}: ${e.name} (${e.start_month}/${e.start_day} - ${e.end_month}/${e.end_day})`);
        });
    };

    // 初期化
    document.addEventListener('DOMContentLoaded', function () {
        const currentEvent = getCurrentEvent();
        if (currentEvent) {
            applyEventTheme(currentEvent);
        }
    });

})();
