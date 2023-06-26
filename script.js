'use strict'
const audio = document.querySelector('#audio');
const playlist = document.querySelector('.playlist');
const btnPlay = document.querySelector('.btn-toggle-play');
const btnNext = document.querySelector('.btn-next');
const btnPrev = document.querySelector('.btn-prev');
const btnRepeat = document.querySelector('.btn-repeat');
const btnRandom = document.querySelector('.btn-random');
const cd = document.querySelector('.cd');
const cdThumb = document.querySelector('.cd-thumb');
const player = document.querySelector('.player');
const labelDuration = document.querySelector('.duration');
const labelCurrentTime = document.querySelector('.current-time');
const progress = document.querySelector('.progress');
const volume = document.querySelector('.volume');
const labelVolume = document.querySelector('.label-volume');
const btnVolume = document.querySelector('.btn-volume');
const btnMute = document.querySelector('.btn-mute');
const volumeSidebar = document.querySelector('#volume');
const btnDarkmode = document.querySelector('.darkmode')

class App {
    #songs = [
        {
            name: '2h',
            image: './img/2h.jpg',
            singer: 'MCK',
            path: './music/2h.mp3'
        },
        {
            name: 'Bad Trip',
            image: './img/badtrip.jpg',
            singer: 'RPT MCK',
            path: './music/badtrip.mp3'
        },
        {
            name: 'Suit & Tie',
            image: './img/suittie.jpg',
            singer: 'RPT MCK ( ft. Hoàng Tôn )',
            path: './music/suittie.mp3',
        },
        // {
        //     name: 'Rumors 💋',
        //     image: './img/rumors.jpg',
        //     singer: 'NEFFEX',
        //     path: './music/rumors.mp3',
        // },
        // {
        //     name: 'Có Em',
        //     image: './img/coem.jpg',
        //     singer: 'Madihu (Feat. Low G)',
        //     path: './music/coem.mp3',
        // },
        // {
        //     name: 'Making My Way',
        //     image: './img/makingmyway.jpg',
        //     singer: 'Sơn Tùng MTP',
        //     path: './music/makingmyway.mp3',
        // },
        // {
        //     name: 'ĐẠI GIA LO',
        //     image: './img/daigialo.jpg',
        //     singer: 'ĐINH TRANG ft. SĨ CHƯƠNG',
        //     path: './music/daigialo.mp3',
        // },
        // {
        //     name: 'Grateful',
        //     image: './img/grateful.jpg',
        //     singer: 'NEFFEX',
        //     path: './music/grateful.mp3',
        // },
        // {
        //     name: 'L.I.E',
        //     image: './img/lie.jpg',
        //     singer: 'MONO',
        //     path: './music/lie.mp3',
        // },
        // {
        //     name: 'Ai Mới Là Kẻ Xấu Xa',
        //     image: './img/aimoilakexauxa.jpg',
        //     singer: 'MCK',
        //     path: './music/aimoilakexauxa.mp3',
        // },
        // {
        //     name: 'Chạy Ngay Đi',
        //     image: './img/chayngaydi.jpg',
        //     singer: 'SƠN TÙNG M-TP',
        //     path: './music/chayngaydi.mp3',
        // },
        // {
        //     name: 'Nếu lúc đó',
        //     image: './img/neulucdo.jpg',
        //     singer: 'tlinh (ft. 2pillz)',
        //     path: './music/neulucdo.mp3',
        // },
        // {
        //     name: 'SUY',
        //     image: './img/suy.jpg',
        //     singer: 'NGER aka MCK',
        //     path: './music/suy.mp3',
        // },
        // {
        //     name: 'Không Thích',
        //     image: './img/kothich.jpg',
        //     singer: 'Low G',
        //     path: './music/kothich.mp3',
        // },
    ];
    #currentIndex;
    #curVol;
    #playedSong = [];
    #isSectionScroll = false;
    #isDarkmode;
    #idTimeOut;
    #isRandom = false;
    #isRepeat = false;
    #cdAnimate = cdThumb.animate([
        { transform: 'rotate(360deg)' }
    ], {
        duration: 10000,
        iterations: Infinity,
    });
    #lightMode = {
        '--text-color': '#333',
        '--body-background': '#f5f5f5',
        '--background-mode': '#fff',
        '--btn-color': '#666',
        '--small-text': '#999',
        '--progress-bar': '#d3d3d3',
        '--border': '#ebebeb',
        '--box-shadow': '0 2px 3px rgba(0, 0, 0, 0.1)'
    };
    #darkMode = {
        '--text-color': '#e4e6eb',
        '--body-background': '#18191a',
        '--background-mode': '#242525',
        '--btn-color': '#e4e6eb',
        '--small-text': '#b0b3b8',
        '--progress-bar': '#434141',
        '--border': '#3c3b3b',
        '--box-shadow': '0 2px 3px rgba(255, 255, 255, 0.1)'
    }
    constructor() {
        this.#renderSong();
        this.#shrinkAndScale();
        playlist.addEventListener('click', this.#playSongWhenClick.bind(this));
        btnPlay.addEventListener('click', this.#playAndPause.bind(this));
        document.addEventListener('keydown', function (e) {
            if (e.key === ' ') this.#playAndPause();
        }.bind(this))
        btnNext.addEventListener('click', this.#nextSong.bind(this));
        btnPrev.addEventListener('click', this.#prevSong.bind(this));
        btnRepeat.addEventListener('click', this.#repeatSong.bind(this));
        btnRandom.addEventListener('click', this.#randomSong.bind(this));
        audio.addEventListener('play', this.#playSong.bind(this));
        audio.addEventListener('pause', this.#pauseSong.bind(this));
        audio.addEventListener('timeupdate', this.#updateTime);
        audio.addEventListener('loadedmetadata', this.#showDuration.bind(this));
        audio.addEventListener('ended', this.#handleEndSong.bind(this));
        progress.addEventListener('input', this.#seekToPos);
        volume.addEventListener('input', this.#customVolume.bind(this));
        volume.addEventListener('click', this.#muteImmediately.bind(this));
        btnDarkmode.addEventListener('click', this.#toggleDarkMode.bind(this));

        //Get from storage
        const storage = this.#getLocalStorage();
        this.#currentIndex = storage?.currentMusic ?? 0;
        this.#curVol = storage?.currentVolume ?? 100;
        this.#isDarkmode = storage?.darkMode || false;
        this.#cdAnimate.pause();

        // Set default
        this.#loadCurrentSong();
        this.#volumeChange(this.#curVol);
        this.#renderDarkmode(btnDarkmode);
        this.#sectionIntoView();
    }
    #renderSong() {
        playlist.innerHTML = '';
        this.#songs.forEach(({ image, name, singer }, i) => {
            const html = `
            <div class="song" data-song="${i}">
            <div class="thumb"
                style="background-image: url(${image})">
            </div>
            <div class="body">
                <h3 class="title">${name}</h3>
                <p class="author">${singer}</p>
            </div>
            <div class="option">
                <i class="fas fa-ellipsis-h"></i>
            </div>
        </div>
            `
            playlist.insertAdjacentHTML('beforeend', html)
        })
    }
    #shrinkAndScale() {
        const cdWidth = cd.getBoundingClientRect().width;

        document.addEventListener('scroll', () => {
            if (this.#isSectionScroll) return;
            const scroll = window.scrollY || document.documentElement.scrollTop;

            const newCdWidth = cdWidth - scroll;
            cd.style.width = `${newCdWidth > 0 ? newCdWidth : 0}px`;
            cd.style.opacity = newCdWidth > 0 ? newCdWidth / cdWidth : 0
        })
    }
    #playAndPause() {
        audio.paused ? audio.play() : audio.pause();
    }

    #playSong() {
        player.classList.add('playing');
        this.#cdAnimate.play();
    }

    #pauseSong() {
        player.classList.remove('playing');
        this.#cdAnimate.pause();
    }

    #loadCurrentSong() {
        const currentSong = this.#songs[this.#currentIndex];
        document.querySelector('header h2').textContent = currentSong.name;
        cdThumb.style.backgroundImage = `url(${currentSong.image})`;
        [...playlist.children].forEach(child => child.classList.remove('active'));
        playlist.querySelector(`.song[data-song="${this.#currentIndex}"]`).classList.add('active');
        audio.src = currentSong.path;
    }
    #playCurrentSong() {
        this.#loadCurrentSong();
        audio.play();
        this.#sectionIntoView.call(this);
        this.#cdAnimate.play();
        this.#setLocalStorage();
    }
    #playSongWhenClick(e) {
        const target = !e.target.classList.contains('fa-ellipsis-h') && e.target.closest('.song')?.dataset.song;
        if (!target || this.#currentIndex === +target) return;
        this.#currentIndex = +target;

        this.#playCurrentSong();
    }
    #nextSong() {
        if (this.#isRandom)
            this.#currentIndex = this.#playRandom();
        else {
            this.#currentIndex++;
            if (this.#currentIndex === this.#songs.length) this.#currentIndex = 0
        }
        this.#playCurrentSong();
    }
    #prevSong() {
        if (this.#isRandom)
            this.#currentIndex = this.#playedSong.pop() || this.#playRandom();
        else {
            this.#currentIndex--;
            if (this.#currentIndex < 0) this.#currentIndex = this.#songs.length - 1;
        }
        this.#playCurrentSong();
    }
    #repeatSong(e) {
        this.#isRepeat = !this.#isRepeat;
        e.currentTarget.classList.toggle('active', this.#isRepeat);
        if (this.#isRandom) {
            this.#isRandom = false;
            btnRandom.classList.remove('active');
        }
        this.#setLocalStorage();
    }
    #randomSong(e) {
        this.#isRandom = !this.#isRandom;
        e.currentTarget.classList.toggle('active', this.#isRandom);
        if (this.#isRepeat) {
            this.#isRepeat = false;
            btnRepeat.classList.remove('active');
        }
        this.#setLocalStorage();
    }
    #playRandom() {
        this.#playedSong.push(this.#currentIndex);
        if (this.#playedSong.length === this.#songs.length) this.#playedSong = [];
        let random = Math.floor(Math.random() * this.#songs.length);
        while (random === this.#currentIndex || this.#playedSong.includes(random))
            random = Math.floor(Math.random() * this.#songs.length);
        return random;
    }
    #handleEndSong() {
        if (this.#isRepeat) audio.play()
        else this.#nextSong();
    }
    #showDuration() {
        const duration = audio.duration;
        const min = `${Math.floor(duration / 60)}`.padStart(2, 0);
        const sec = `${Math.floor(duration % 60)}`.padStart(2, 0);
        labelDuration.textContent = `${min}:${sec}`;
    }
    #updateTime() {
        const currentTime = audio.currentTime;
        const min = `${Math.floor(currentTime / 60)}`.padStart(2, 0);
        const sec = `${Math.floor(currentTime % 60)}`.padStart(2, 0);
        labelCurrentTime.textContent = `${min}:${sec}`;

        const duration = audio.duration;
        const percent = currentTime / duration * 1000;
        isFinite(percent) ? progress.value = Math.floor(percent) : progress.value = 0;
    }
    #seekToPos() {
        const pos = this.value;
        const duration = audio.duration;

        audio.currentTime = pos * duration / 1000;
    }
    #customVolume(e) {
        const targetVolume = +e.target.value;
        this.#curVol = targetVolume;
        this.#volumeChange(targetVolume);
        btnMute.classList.toggle('none', targetVolume !== 0);
        btnVolume.classList.toggle('none', targetVolume === 0);
    }
    #volumeChange(vol) {
        audio.volume = vol / 100;
        labelVolume.textContent = `${vol}`.padStart(2, 0);
        volumeSidebar.value = vol;
        this.#setLocalStorage();
    }
    #muteImmediately(e) {
        if (!e.target.classList.contains('btn')) return;
        e.currentTarget.querySelectorAll('.btn').forEach(btn => btn.classList.toggle('none'));
        if (e.target.classList.contains('btn-volume')) {
            this.#curVol = +volumeSidebar.value;
            this.#volumeChange(0);
        } else
            this.#volumeChange(this.#curVol);
    }
    #sectionIntoView() {
        this.#isSectionScroll = true;
        const el = document.querySelector(`.song[data-song="${this.#currentIndex}"`);
        el.scrollIntoView({ behavior: 'smooth', block: 'end' });
        cd.style.width = '200px';
        cd.style.opacity = 1;
        clearTimeout(this.#idTimeOut);
        this.#idTimeOut = setTimeout(() => this.#isSectionScroll = false, 1000);
    }
    #setLocalStorage() {
        const objStorage = {
            currentMusic: this.#currentIndex,
            currentVolume: this.#curVol,
            darkMode: this.#isDarkmode,
        }
        localStorage.setItem('musicPlayer', JSON.stringify(objStorage));
    }
    #getLocalStorage() {
        const current = JSON.parse(localStorage.getItem('musicPlayer'));
        if (!current) return;
        return current
    }
    #toggleDarkMode(e) {
        this.#isDarkmode = !this.#isDarkmode;
        this.#renderDarkmode(e.currentTarget);
        this.#setLocalStorage();
    }
    #renderDarkmode(curTarget) {
        curTarget.querySelector('.btn-off').classList.toggle('none', !this.#isDarkmode);
        curTarget.querySelector('.btn-on').classList.toggle('none', this.#isDarkmode);
        const text = curTarget.querySelector('span');
        const data = this.#isDarkmode ? this.#darkMode : this.#lightMode;
        text.textContent = this.#isDarkmode ? 'Light Mode' : 'Dark Mode';

        Object.entries(data).forEach(([key, value]) => document.documentElement.style.setProperty(key, value));
    }
    reset() {
        localStorage.clear();
        location.reload();
    }
}
const app = new App();

