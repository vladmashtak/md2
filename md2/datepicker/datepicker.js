var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Component, ElementRef, HostListener, Input, Output, Optional, EventEmitter, Renderer, Self, ViewChildren, QueryList, ViewEncapsulation, NgModule } from '@angular/core';
import { NgControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Md2DateUtil } from './dateUtil';
import { DateLocale } from './date-locale';
import { coerceBooleanProperty, ENTER, SPACE, TAB, ESCAPE, HOME, END, PAGE_UP, PAGE_DOWN, LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW, Overlay, OverlayState, OverlayModule, TemplatePortalDirective, PortalModule } from '../core';
import { fadeInContent } from './datepicker-animations';
/** Change event object emitted by Md2Select. */
export var Md2DateChange = (function () {
    function Md2DateChange(source, date) {
        this.source = source;
        this.date = date;
    }
    return Md2DateChange;
}());
var nextId = 0;
export var Md2Datepicker = (function () {
    function Md2Datepicker(_element, overlay, _renderer, _dateUtil, _locale, _control) {
        var _this = this;
        this._element = _element;
        this.overlay = overlay;
        this._renderer = _renderer;
        this._dateUtil = _dateUtil;
        this._locale = _locale;
        this._control = _control;
        this._date = null;
        this._panelOpen = false;
        this._selected = null;
        this._openOnFocus = false;
        this._transformOrigin = 'top';
        this._panelDoneAnimating = false;
        /** Event emitted when the select has been opened. */
        this.onOpen = new EventEmitter();
        /** Event emitted when the select has been closed. */
        this.onClose = new EventEmitter();
        /** Event emitted when the selected date has been changed by the user. */
        this.change = new EventEmitter();
        this._format = this.type === 'date' ?
            'DD/MM/YYYY' : this.type === 'time' ? 'HH:mm' : this.type === 'datetime' ?
            'DD/MM/YYYY HH:mm' : 'DD/MM/YYYY';
        this._required = false;
        this._disabled = false;
        this._isInitialized = false;
        this._onChange = function (value) { };
        this._onTouched = function () { };
        this._isHoursVisible = true;
        this._hours = [];
        this._minutes = [];
        this._prevMonth = 1;
        this._currMonth = 2;
        this._nextMonth = 3;
        this._years = [];
        this._dates = [];
        this.today = new Date();
        this._displayDate = null;
        this._viewDay = { year: 0, month: '', date: '', day: '', hour: '', minute: '' };
        this._viewValue = '';
        this._clock = {
            dialRadius: 120,
            outerRadius: 99,
            innerRadius: 66,
            tickRadius: 17,
            hand: { x: 0, y: 0 },
            x: 0, y: 0,
            dx: 0, dy: 0,
            moved: false
        };
        this._min = null;
        this._max = null;
        this.type = 'date';
        this.name = '';
        this.id = 'md2-datepicker-' + (++nextId);
        this.tabindex = 0;
        if (this._control) {
            this._control.valueAccessor = this;
        }
        this._weekDays = _locale.days;
        this.getYears();
        this.generateClock();
        this.mouseMoveListener = function (event) { _this._handleMousemove(event); };
        this.mouseUpListener = function (event) { _this._handleMouseup(event); };
    }
    Md2Datepicker.prototype.ngAfterContentInit = function () {
        this._isInitialized = true;
        this._isCalendarVisible = this.type !== 'time' ? true : false;
    };
    Md2Datepicker.prototype.ngOnDestroy = function () { this.destroyPanel(); };
    Object.defineProperty(Md2Datepicker.prototype, "date", {
        get: function () { return this._date; },
        set: function (value) {
            this._date = this.coerceDateProperty(value);
            if (value && value !== this._date) {
                if (this._dateUtil.isValidDate(value)) {
                    this._date = value;
                }
                else {
                    if (this.type === 'time') {
                        this._date = new Date('1-1-1 ' + value);
                    }
                    else {
                        this._date = new Date(value);
                    }
                }
                this._viewValue = this._formatDate(this._date);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Md2Datepicker.prototype, "selected", {
        get: function () { return this._selected; },
        set: function (value) { this._selected = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Md2Datepicker.prototype, "openOnFocus", {
        get: function () { return this._openOnFocus; },
        set: function (value) { this._openOnFocus = coerceBooleanProperty(value); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Md2Datepicker.prototype, "isOpen", {
        set: function (value) {
            if (value && !this.panelOpen) {
                this.open();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Md2Datepicker.prototype, "panelOpen", {
        get: function () {
            return this._panelOpen;
        },
        enumerable: true,
        configurable: true
    });
    Md2Datepicker.prototype.toggle = function () {
        this.panelOpen ? this.close() : this.open();
    };
    /** Opens the overlay panel. */
    Md2Datepicker.prototype.open = function () {
        if (this.disabled) {
            return;
        }
        this._createOverlay();
        this._overlayRef.attach(this.templatePortals.first);
        this._subscribeToBackdrop();
        this._panelOpen = true;
        this._showDatepicker();
    };
    /** Closes the overlay panel and focuses the host element. */
    Md2Datepicker.prototype.close = function () {
        var _this = this;
        setTimeout(function () {
            _this._panelOpen = false;
            //if (!this._date) {
            //  this._placeholderState = '';
            //}
            if (_this._overlayRef) {
                _this._overlayRef.detach();
                _this._backdropSubscription.unsubscribe();
            }
            _this._focusHost();
            _this._isYearsVisible = false;
            _this._isCalendarVisible = _this.type !== 'time' ? true : false;
            _this._isHoursVisible = true;
        }, 10);
    };
    /** Removes the panel from the DOM. */
    Md2Datepicker.prototype.destroyPanel = function () {
        if (this._overlayRef) {
            this._overlayRef.dispose();
            this._overlayRef = null;
            this._cleanUpSubscriptions();
        }
    };
    Md2Datepicker.prototype._onPanelDone = function () {
        if (this.panelOpen) {
            this._focusPanel();
            this.onOpen.emit();
        }
        else {
            this.onClose.emit();
        }
    };
    Md2Datepicker.prototype._onFadeInDone = function () {
        this._panelDoneAnimating = this.panelOpen;
    };
    Md2Datepicker.prototype._focusPanel = function () {
        var el = document.querySelectorAll('.md2-datepicker-panel')[0];
        el.focus();
    };
    Md2Datepicker.prototype._focusHost = function () {
        this._renderer.invokeElementMethod(this._element.nativeElement, 'focus');
    };
    Md2Datepicker.prototype.coerceDateProperty = function (value, fallbackValue) {
        if (fallbackValue === void 0) { fallbackValue = new Date(); }
        var timestamp = Date.parse(value);
        return isNaN(timestamp) ? fallbackValue : new Date(timestamp);
    };
    Object.defineProperty(Md2Datepicker.prototype, "format", {
        get: function () { return this._format; },
        set: function (value) {
            if (this._format !== value) {
                this._format = value || this._format;
                if (this._viewValue && this._date) {
                    this._viewValue = this._formatDate(this._date);
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Md2Datepicker.prototype, "required", {
        get: function () { return this._required; },
        set: function (value) { this._required = coerceBooleanProperty(value); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Md2Datepicker.prototype, "disabled", {
        get: function () { return this._disabled; },
        set: function (value) { this._disabled = coerceBooleanProperty(value); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Md2Datepicker.prototype, "min", {
        set: function (value) {
            if (value && this._dateUtil.isValidDate(value)) {
                this._min = new Date(value);
                this._min.setHours(0, 0, 0, 0);
                this.getYears();
            }
            else {
                this._min = null;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Md2Datepicker.prototype, "max", {
        set: function (value) {
            if (value && this._dateUtil.isValidDate(value)) {
                this._max = new Date(value);
                this._max.setHours(0, 0, 0, 0);
                this.getYears();
            }
            else {
                this._max = null;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Md2Datepicker.prototype, "displayDate", {
        get: function () {
            if (this._displayDate && this._dateUtil.isValidDate(this._displayDate)) {
                return this._displayDate;
            }
            else {
                return this.today;
            }
        },
        set: function (date) {
            if (date && this._dateUtil.isValidDate(date)) {
                if (this._min && this._min > date) {
                    date = this._min;
                }
                if (this._max && this._max < date) {
                    date = this._max;
                }
                this._displayDate = date;
                this._viewDay = {
                    year: date.getFullYear(),
                    month: this._locale.months[date.getMonth()].full,
                    date: this._prependZero(date.getDate() + ''),
                    day: this._locale.days[date.getDay()].full,
                    hour: this._prependZero(date.getHours() + ''),
                    minute: this._prependZero(date.getMinutes() + '')
                };
            }
        },
        enumerable: true,
        configurable: true
    });
    Md2Datepicker.prototype._handleClick = function (event) {
        if (this.disabled) {
            event.stopPropagation();
            event.preventDefault();
            return;
        }
    };
    Md2Datepicker.prototype._handleKeydown = function (event) {
        if (this.disabled) {
            return;
        }
        if (this.panelOpen) {
            event.preventDefault();
            event.stopPropagation();
            switch (event.keyCode) {
                case TAB:
                case ESCAPE:
                    this._onBlur();
                    this.close();
                    break;
            }
            var displayDate = this.displayDate;
            if (this._isYearsVisible) {
                switch (event.keyCode) {
                    case ENTER:
                    case SPACE:
                        this._onClickOk();
                        break;
                    case DOWN_ARROW:
                        if (this.displayDate.getFullYear() < (this.today.getFullYear() + 100)) {
                            this.displayDate = this._dateUtil.incrementYears(displayDate, 1);
                            this._scrollToSelectedYear();
                        }
                        break;
                    case UP_ARROW:
                        if (this.displayDate.getFullYear() > 1900) {
                            this.displayDate = this._dateUtil.incrementYears(displayDate, -1);
                            this._scrollToSelectedYear();
                        }
                        break;
                }
            }
            else if (this._isCalendarVisible) {
                switch (event.keyCode) {
                    case ENTER:
                    case SPACE:
                        this.setDate(this.displayDate);
                        break;
                    case RIGHT_ARROW:
                        this.displayDate = this._dateUtil.incrementDays(displayDate, 1);
                        break;
                    case LEFT_ARROW:
                        this.displayDate = this._dateUtil.incrementDays(displayDate, -1);
                        break;
                    case PAGE_DOWN:
                        if (event.shiftKey) {
                            this.displayDate = this._dateUtil.incrementYears(displayDate, 1);
                        }
                        else {
                            this.displayDate = this._dateUtil.incrementMonths(displayDate, 1);
                        }
                        break;
                    case PAGE_UP:
                        if (event.shiftKey) {
                            this.displayDate = this._dateUtil.incrementYears(displayDate, -1);
                        }
                        else {
                            this.displayDate = this._dateUtil.incrementMonths(displayDate, -1);
                        }
                        break;
                    case DOWN_ARROW:
                        this.displayDate = this._dateUtil.incrementDays(displayDate, 7);
                        break;
                    case UP_ARROW:
                        this.displayDate = this._dateUtil.incrementDays(displayDate, -7);
                        break;
                    case HOME:
                        this.displayDate = this._dateUtil.getFirstDateOfMonth(displayDate);
                        break;
                    case END:
                        this.displayDate = this._dateUtil.getLastDateOfMonth(displayDate);
                        break;
                }
                if (!this._dateUtil.isSameMonthAndYear(displayDate, this.displayDate)) {
                    this.generateCalendar();
                }
            }
            else if (this._isHoursVisible) {
                switch (event.keyCode) {
                    case ENTER:
                    case SPACE:
                        this.setHour(this.displayDate.getHours());
                        break;
                    case UP_ARROW:
                        this.displayDate = this._dateUtil.incrementHours(displayDate, 1);
                        this._resetClock();
                        break;
                    case DOWN_ARROW:
                        this.displayDate = this._dateUtil.incrementHours(displayDate, -1);
                        this._resetClock();
                        break;
                }
            }
            else {
                switch (event.keyCode) {
                    case ENTER:
                    case SPACE:
                        this.setMinute(this.displayDate.getMinutes());
                        break;
                    case UP_ARROW:
                        this.displayDate = this._dateUtil.incrementMinutes(displayDate, 1);
                        this._resetClock();
                        break;
                    case DOWN_ARROW:
                        this.displayDate = this._dateUtil.incrementMinutes(displayDate, -1);
                        this._resetClock();
                        break;
                }
            }
        }
        else {
            switch (event.keyCode) {
                case ENTER:
                case SPACE:
                    event.preventDefault();
                    event.stopPropagation();
                    this.open();
                    break;
            }
        }
    };
    Md2Datepicker.prototype._onFocus = function () {
        if (!this.panelOpen && this.openOnFocus) {
            this.open();
        }
    };
    Md2Datepicker.prototype._onBlur = function () {
        if (!this.panelOpen) {
            this._onTouched();
        }
    };
    /**
     * Display Years
     */
    Md2Datepicker.prototype._showYear = function () {
        this._isYearsVisible = true;
        this._isCalendarVisible = true;
        this._scrollToSelectedYear();
    };
    Md2Datepicker.prototype.getYears = function () {
        var startYear = this._min ? this._min.getFullYear() : 1900, endYear = this._max ? this._max.getFullYear() : this.today.getFullYear() + 100;
        this._years = [];
        for (var i = startYear; i <= endYear; i++) {
            this._years.push(i);
        }
    };
    Md2Datepicker.prototype._scrollToSelectedYear = function () {
        var _this = this;
        setTimeout(function () {
            var yearContainer = _this._element.nativeElement.querySelector('.md2-calendar-years'), selectedYear = _this._element.nativeElement.querySelector('.md2-calendar-year.selected');
            yearContainer.scrollTop = (selectedYear.offsetTop + 20) - yearContainer.clientHeight / 2;
        }, 0);
    };
    /**
     * select year
     * @param year
     */
    Md2Datepicker.prototype._setYear = function (year) {
        var date = this.displayDate;
        this.displayDate = new Date(year, date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());
        this.generateCalendar();
        this._isYearsVisible = false;
    };
    /**
     * Display Datepicker
     */
    Md2Datepicker.prototype._showDatepicker = function () {
        if (this.disabled) {
            return;
        }
        this.selected = this.date || new Date(1, 0, 1);
        this.displayDate = this.date || this.today;
        this.generateCalendar();
        this._resetClock();
        this._element.nativeElement.focus();
    };
    /**
     * Display Calendar
     */
    Md2Datepicker.prototype._showCalendar = function () {
        this._isYearsVisible = false;
        this._isCalendarVisible = true;
    };
    /**
     * Toggle Hour visiblity
     */
    Md2Datepicker.prototype._toggleHours = function (value) {
        this._isYearsVisible = false;
        this._isCalendarVisible = false;
        this._isYearsVisible = false;
        this._isHoursVisible = value;
        this._resetClock();
    };
    /**
     * Ok Button Event
     */
    Md2Datepicker.prototype._onClickOk = function () {
        if (this._isYearsVisible) {
            this.generateCalendar();
            this._isYearsVisible = false;
            this._isCalendarVisible = true;
        }
        else if (this._isCalendarVisible) {
            this.setDate(this.displayDate);
        }
        else if (this._isHoursVisible) {
            this._isHoursVisible = false;
            this._resetClock();
        }
        else {
            this.date = this.displayDate;
            this._emitChangeEvent();
            this._onBlur();
            this.close();
        }
    };
    /**
     * Date Selection Event
     * @param event Event Object
     * @param date Date Object
     */
    Md2Datepicker.prototype._onClickDate = function (event, date) {
        event.preventDefault();
        event.stopPropagation();
        if (date.disabled) {
            return;
        }
        if (date.calMonth === this._prevMonth) {
            this._updateMonth(-1);
        }
        else if (date.calMonth === this._currMonth) {
            this.setDate(new Date(date.dateObj.year, date.dateObj.month, date.dateObj.day, this.displayDate.getHours(), this.displayDate.getMinutes()));
        }
        else if (date.calMonth === this._nextMonth) {
            this._updateMonth(1);
        }
    };
    /**
     * Set Date
     * @param date Date Object
     */
    Md2Datepicker.prototype.setDate = function (date) {
        if (this.type === 'date') {
            this.date = date;
            this._emitChangeEvent();
            this._onBlur();
            this.close();
        }
        else {
            this.selected = date;
            this.displayDate = date;
            this._isCalendarVisible = false;
            this._isHoursVisible = true;
            this._resetClock();
        }
    };
    /**
     * Update Month
     * @param noOfMonths increment number of months
     */
    Md2Datepicker.prototype._updateMonth = function (noOfMonths) {
        this.displayDate = this._dateUtil.incrementMonths(this.displayDate, noOfMonths);
        this.generateCalendar();
    };
    /**
     * Check is Before month enabled or not
     * @return boolean
     */
    Md2Datepicker.prototype._isBeforeMonth = function () {
        return !this._min ? true :
            this._min && this._dateUtil.getMonthDistance(this.displayDate, this._min) < 0;
    };
    /**
     * Check is After month enabled or not
     * @return boolean
     */
    Md2Datepicker.prototype._isAfterMonth = function () {
        return !this._max ? true :
            this._max && this._dateUtil.getMonthDistance(this.displayDate, this._max) > 0;
    };
    /**
     * Check the date is enabled or not
     * @param date Date Object
     * @return boolean
     */
    Md2Datepicker.prototype._isDisabledDate = function (date) {
        if (this._min && this._max) {
            return (this._min > date) || (this._max < date);
        }
        else if (this._min) {
            return (this._min > date);
        }
        else if (this._max) {
            return (this._max < date);
        }
        else {
            return false;
        }
        // if (this.disableWeekends) {
        //   let dayNbr = this.getDayNumber(date);
        //   if (dayNbr === 0 || dayNbr === 6) {
        //     return true;
        //   }
        // }
        // return false;
    };
    /**
     * Generate Month Calendar
     */
    Md2Datepicker.prototype.generateCalendar = function () {
        var year = this.displayDate.getFullYear();
        var month = this.displayDate.getMonth();
        this._dates.length = 0;
        var firstDayOfMonth = this._dateUtil.getFirstDateOfMonth(this.displayDate);
        var numberOfDaysInMonth = this._dateUtil.getNumberOfDaysInMonth(this.displayDate);
        var numberOfDaysInPrevMonth = this._dateUtil.getNumberOfDaysInMonth(this._dateUtil.incrementMonths(this.displayDate, -1));
        var dayNbr = 1;
        var calMonth = this._prevMonth;
        for (var i = 1; i < 7; i++) {
            var week = [];
            if (i === 1) {
                var prevMonth = numberOfDaysInPrevMonth - firstDayOfMonth.getDay() + 1;
                for (var j = prevMonth; j <= numberOfDaysInPrevMonth; j++) {
                    var iDate = { year: year, month: month - 1, day: j, hour: 0, minute: 0 };
                    var date = new Date(year, month - 1, j);
                    week.push({
                        date: date,
                        dateObj: iDate,
                        calMonth: calMonth,
                        today: this._dateUtil.isSameDay(this.today, date),
                        disabled: this._isDisabledDate(date)
                    });
                }
                calMonth = this._currMonth;
                var daysLeft = 7 - week.length;
                for (var j = 0; j < daysLeft; j++) {
                    var iDate = { year: year, month: month, day: dayNbr, hour: 0, minute: 0 };
                    var date = new Date(year, month, dayNbr);
                    week.push({
                        date: date,
                        dateObj: iDate,
                        calMonth: calMonth,
                        today: this._dateUtil.isSameDay(this.today, date),
                        disabled: this._isDisabledDate(date)
                    });
                    dayNbr++;
                }
            }
            else {
                for (var j = 1; j < 8; j++) {
                    if (dayNbr > numberOfDaysInMonth) {
                        dayNbr = 1;
                        calMonth = this._nextMonth;
                    }
                    var iDate = {
                        year: year,
                        month: calMonth === this._currMonth ? month : month + 1,
                        day: dayNbr, hour: 0, minute: 0
                    };
                    var date = new Date(year, iDate.month, dayNbr);
                    week.push({
                        date: date,
                        dateObj: iDate,
                        calMonth: calMonth,
                        today: this._dateUtil.isSameDay(this.today, date),
                        disabled: this._isDisabledDate(date)
                    });
                    dayNbr++;
                }
            }
            this._dates.push(week);
        }
    };
    /**
     * Select Hour
     * @param event Event Object
     * @param hour number of hours
     */
    Md2Datepicker.prototype._onClickHour = function (event, hour) {
        event.preventDefault();
        event.stopPropagation();
        this.setHour(hour);
    };
    /**
     * Select Minute
     * @param event Event Object
     * @param minute number of minutes
     */
    Md2Datepicker.prototype._onClickMinute = function (event, minute) {
        event.preventDefault();
        event.stopPropagation();
        this.setMinute(minute);
    };
    /**
     * Set hours
     * @param hour number of hours
     */
    Md2Datepicker.prototype.setHour = function (hour) {
        var date = this.displayDate;
        this._isHoursVisible = false;
        this.displayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, date.getMinutes());
        this._resetClock();
    };
    /**
     * Set minutes
     * @param minute number of minutes
     */
    Md2Datepicker.prototype.setMinute = function (minute) {
        var date = this.displayDate;
        this.displayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), minute);
        this.selected = this.displayDate;
        this.date = this.displayDate;
        this._emitChangeEvent();
        this._onBlur();
        this.close();
    };
    Md2Datepicker.prototype._handleMousedown = function (event) {
        console.log('Down');
        document.addEventListener('mousemove', this.mouseMoveListener);
        document.addEventListener('mouseup', this.mouseUpListener);
        // let offset = this.offset(event.currentTarget)
        // this._clock.x = offset.left + this._clock.dialRadius;
        // this._clock.y = offset.top + this._clock.dialRadius;
        // this._clock.dx = event.pageX - this._clock.x;
        // this._clock.dy = event.pageY - this._clock.y;
        // let z = Math.sqrt(this._clock.dx * this._clock.dx + this._clock.dy * this._clock.dy);
        // if (z < this._clock.outerRadius - this._clock.tickRadius || z > this._clock.outerRadius
        //  + this._clock.tickRadius) { return; }
        // event.preventDefault();
        // this.setClockHand(this._clock.dx, this._clock.dy);
        // // this.onMouseMoveClock = this.onMouseMoveClock.bind(this);
        // // this.onMouseUpClock = this.onMouseUpClock.bind(this);
        // document.addEventListener('mousemove', this.onMouseMoveClock);
        // document.addEventListener('mouseup', this.onMouseUpClock);
        /*
        var offset = plate.offset(),
                    isTouch = /^touch/.test(e.type),
                    x0 = offset.left + dialRadius,
                    y0 = offset.top + dialRadius,
                    dx = (isTouch ? e.originalEvent.touches[0] : e).pageX - x0,
                    dy = (isTouch ? e.originalEvent.touches[0] : e).pageY - y0,
                    z = Math.sqrt(dx * dx + dy * dy),
                    moved = false;
    
                // When clicking on minutes view space, check the mouse position
                if (space && (z < outerRadius - tickRadius || z > outerRadius + tickRadius)) {
                    return;
                }
                e.preventDefault();
    
                // Set cursor style of body after 200ms
                var movingTimer = setTimeout(function(){
                    $body.addClass('clockpicker-moving');
                }, 200);
    
                // Place the canvas to top
                if (svgSupported) {
                    plate.append(self.canvas);
                }
    
                // Clock
                self.setHand(dx, dy, ! space, true);
        */
    };
    Md2Datepicker.prototype._handleMousemove = function (event) {
        console.log('move');
        //   event.preventDefault();
        //   event.stopPropagation();
        //   let x = event.pageX - this._clock.x,
        //     y = event.pageY - this._clock.y;
        //   this._clock.moved = true;
        //   this._setClockHand(x, y);// , false, true
        //   // if (!moved && x === dx && y === dy) {
        //   //   // Clicking in chrome on windows will trigger a mousemove event
        //   //   return;
        //   // }
        /*
        e.preventDefault();
                    var isTouch = /^touch/.test(e.type),
                        x = (isTouch ? e.originalEvent.touches[0] : e).pageX - x0,
                        y = (isTouch ? e.originalEvent.touches[0] : e).pageY - y0;
                    if (! moved && x === dx && y === dy) {
                        // Clicking in chrome on windows will trigger a mousemove event
                        return;
                    }
                    moved = true;
                    self.setHand(x, y, false, true);
        */
    };
    Md2Datepicker.prototype._handleMouseup = function (event) {
        console.log('Up');
        //   event.preventDefault();
        document.removeEventListener('mousemove', this.mouseMoveListener);
        document.removeEventListener('mouseup', this.mouseUpListener);
        //   // let space = false;
        //   let x = event.pageX - this._clock.x,
        //     y = event.pageY - this._clock.y;
        //   if ((space || this._clockEvent.moved) && x === this._clockEvent.dx && 
        //    y === this._clockEvent.dy) {
        //     this.setClockHand(x, y);
        //   }
        //   // if (this._isHoursVisible) {
        //   //   // self.toggleView('minutes', duration / 2);
        //   // } else {
        //   //   // if (options.autoclose) {
        //   //   //   self.minutesView.addClass('clockpicker-dial-out');
        //   //   //   setTimeout(function () {
        //   //   //     self.done();
        //   //   //   }, duration / 2);
        //   //   // }
        //   // }
        //   if ((space || moved) && x === dx && y === dy) {
        //     self.setHand(x, y);
        //   }
        //   if (self.currentView === 'hours') {
        //     self.toggleView('minutes', duration / 2);
        //   } else {
        //     if (options.autoclose) {
        //       self.minutesView.addClass('clockpicker-dial-out');
        //       setTimeout(function () {
        //         self.done();
        //       }, duration / 2);
        //     }
        //   }
        //   plate.prepend(canvas);
        //   // Reset cursor style of body
        //   clearTimeout(movingTimer);
        //   $body.removeClass('clockpicker-moving');
        /*
        $doc.off(mouseupEvent);
                    e.preventDefault();
                    var isTouch = /^touch/.test(e.type),
                        x = (isTouch ? e.originalEvent.changedTouches[0] : e).pageX - x0,
                        y = (isTouch ? e.originalEvent.changedTouches[0] : e).pageY - y0;
                    if ((space || moved) && x === dx && y === dy) {
                        self.setHand(x, y);
                    }
                    if (self.currentView === 'hours') {
                        self.toggleView('minutes', duration / 2);
                    } else {
                        if (options.autoclose) {
                            self.minutesView.addClass('clockpicker-dial-out');
                            setTimeout(function(){
                                self.done();
                            }, duration / 2);
                        }
                    }
                    plate.prepend(canvas);
    
                    // Reset cursor style of body
                    clearTimeout(movingTimer);
                    $body.removeClass('clockpicker-moving');
    
                    // Unbind mousemove event
                    $doc.off(mousemoveEvent);
    
        */
    };
    /**
     * reser clock hands
     */
    Md2Datepicker.prototype._resetClock = function () {
        var hour = this.displayDate.getHours();
        var minute = this.displayDate.getMinutes();
        var value = this._isHoursVisible ? hour : minute, unit = Math.PI / (this._isHoursVisible ? 6 : 30), radian = value * unit, radius = this._isHoursVisible && value > 0 && value < 13 ?
            this._clock.innerRadius : this._clock.outerRadius, x = Math.sin(radian) * radius, y = -Math.cos(radian) * radius;
        this._setClockHand(x, y);
    };
    /**
     * set clock hand
     * @param x number of x position
     * @param y number of y position
     */
    Md2Datepicker.prototype._setClockHand = function (x, y) {
        var radian = Math.atan2(x, y), unit = Math.PI / (this._isHoursVisible ? 6 : 30), z = Math.sqrt(x * x + y * y), inner = this._isHoursVisible && z < (this._clock.outerRadius + this._clock.innerRadius) / 2, radius = inner ? this._clock.innerRadius : this._clock.outerRadius, value = 0;
        if (radian < 0) {
            radian = Math.PI * 2 + radian;
        }
        value = Math.round(radian / unit);
        radian = value * unit;
        if (this._isHoursVisible) {
            if (value === 12) {
                value = 0;
            }
            value = inner ? (value === 0 ? 12 : value) : value === 0 ? 0 : value + 12;
        }
        else {
            if (value === 60) {
                value = 0;
            }
        }
        this._clock.hand = {
            x: Math.sin(radian) * radius,
            y: Math.cos(radian) * radius
        };
    };
    /**
     * render Click
     */
    Md2Datepicker.prototype.generateClock = function () {
        this._hours.length = 0;
        for (var i = 0; i < 24; i++) {
            var radian = i / 6 * Math.PI;
            var inner = i > 0 && i < 13, radius = inner ? this._clock.innerRadius : this._clock.outerRadius;
            this._hours.push({
                hour: i === 0 ? '00' : i,
                top: this._clock.dialRadius - Math.cos(radian) * radius - this._clock.tickRadius,
                left: this._clock.dialRadius + Math.sin(radian) * radius - this._clock.tickRadius
            });
        }
        for (var i = 0; i < 60; i += 5) {
            var radian = i / 30 * Math.PI;
            this._minutes.push({
                minute: i === 0 ? '00' : i,
                top: this._clock.dialRadius - Math.cos(radian) * this._clock.outerRadius -
                    this._clock.tickRadius,
                left: this._clock.dialRadius + Math.sin(radian) * this._clock.outerRadius -
                    this._clock.tickRadius
            });
        }
    };
    /**
     * format date
     * @param date Date Object
     * @return string with formatted date
     */
    Md2Datepicker.prototype._formatDate = function (date) {
        return this.format
            .replace('YYYY', date.getFullYear() + '')
            .replace('MM', this._prependZero((date.getMonth() + 1) + ''))
            .replace('DD', this._prependZero(date.getDate() + ''))
            .replace('HH', this._prependZero(date.getHours() + ''))
            .replace('mm', this._prependZero(date.getMinutes() + ''))
            .replace('ss', this._prependZero(date.getSeconds() + ''));
    };
    /**
     * Prepend Zero
     * @param value String value
     * @return string with prepend Zero
     */
    Md2Datepicker.prototype._prependZero = function (value) {
        return parseInt(value) < 10 ? '0' + value : value;
    };
    /**
     * Get Offset
     * @param element HtmlElement
     * @return top, left offset from page
     */
    Md2Datepicker.prototype._offset = function (element) {
        var top = 0, left = 0;
        do {
            top += element.offsetTop || 0;
            left += element.offsetLeft || 0;
            element = element.offsetParent;
        } while (element);
        return {
            top: top,
            left: left
        };
    };
    /** Emits an event when the user selects a date. */
    Md2Datepicker.prototype._emitChangeEvent = function () {
        this._onChange(this.date);
        this.change.emit(new Md2DateChange(this, this.date));
    };
    Md2Datepicker.prototype.writeValue = function (value) {
        if (value && value !== this._date) {
            if (this._dateUtil.isValidDate(value)) {
                this._date = value;
            }
            else {
                if (this.type === 'time') {
                    this._date = new Date();
                    this._date.setHours(value.substring(0, 2));
                    this._date.setMinutes(value.substring(3, 5));
                }
                else {
                    this._date = new Date(value);
                }
            }
            this._viewValue = this._formatDate(this._date);
        }
        else {
            this._date = null;
            this._viewValue = null;
        }
    };
    Md2Datepicker.prototype.registerOnChange = function (fn) { this._onChange = fn; };
    Md2Datepicker.prototype.registerOnTouched = function (fn) { this._onTouched = fn; };
    Md2Datepicker.prototype._subscribeToBackdrop = function () {
        var _this = this;
        this._backdropSubscription = this._overlayRef.backdropClick().subscribe(function () {
            _this.close();
        });
    };
    /**
     *  This method creates the overlay from the provided panel's template and saves its
     *  OverlayRef so that it can be attached to the DOM when open is called.
     */
    Md2Datepicker.prototype._createOverlay = function () {
        if (!this._overlayRef) {
            var config = new OverlayState();
            config.positionStrategy = this.overlay.position()
                .global()
                .centerHorizontally()
                .centerVertically();
            config.hasBackdrop = true;
            config.backdropClass = 'cdk-overlay-dark-backdrop';
            this._overlayRef = this.overlay.create(config);
        }
    };
    Md2Datepicker.prototype._cleanUpSubscriptions = function () {
        if (this._backdropSubscription) {
            this._backdropSubscription.unsubscribe();
        }
    };
    __decorate([
        ViewChildren(TemplatePortalDirective), 
        __metadata('design:type', QueryList)
    ], Md2Datepicker.prototype, "templatePortals", void 0);
    __decorate([
        Output(), 
        __metadata('design:type', EventEmitter)
    ], Md2Datepicker.prototype, "onOpen", void 0);
    __decorate([
        Output(), 
        __metadata('design:type', EventEmitter)
    ], Md2Datepicker.prototype, "onClose", void 0);
    __decorate([
        Output(), 
        __metadata('design:type', EventEmitter)
    ], Md2Datepicker.prototype, "change", void 0);
    __decorate([
        Input(), 
        __metadata('design:type', Object)
    ], Md2Datepicker.prototype, "date", null);
    __decorate([
        Input(), 
        __metadata('design:type', Object)
    ], Md2Datepicker.prototype, "selected", null);
    __decorate([
        Input(), 
        __metadata('design:type', Boolean)
    ], Md2Datepicker.prototype, "openOnFocus", null);
    __decorate([
        Input(), 
        __metadata('design:type', Boolean), 
        __metadata('design:paramtypes', [Boolean])
    ], Md2Datepicker.prototype, "isOpen", null);
    __decorate([
        Input(), 
        __metadata('design:type', Object)
    ], Md2Datepicker.prototype, "type", void 0);
    __decorate([
        Input(), 
        __metadata('design:type', String)
    ], Md2Datepicker.prototype, "name", void 0);
    __decorate([
        Input(), 
        __metadata('design:type', String)
    ], Md2Datepicker.prototype, "id", void 0);
    __decorate([
        Input(), 
        __metadata('design:type', String)
    ], Md2Datepicker.prototype, "placeholder", void 0);
    __decorate([
        Input(), 
        __metadata('design:type', Number)
    ], Md2Datepicker.prototype, "tabindex", void 0);
    __decorate([
        Input(), 
        __metadata('design:type', String)
    ], Md2Datepicker.prototype, "format", null);
    __decorate([
        Input(), 
        __metadata('design:type', Boolean)
    ], Md2Datepicker.prototype, "required", null);
    __decorate([
        Input(), 
        __metadata('design:type', Boolean)
    ], Md2Datepicker.prototype, "disabled", null);
    __decorate([
        Input(), 
        __metadata('design:type', Date), 
        __metadata('design:paramtypes', [Date])
    ], Md2Datepicker.prototype, "min", null);
    __decorate([
        Input(), 
        __metadata('design:type', Date), 
        __metadata('design:paramtypes', [Date])
    ], Md2Datepicker.prototype, "max", null);
    __decorate([
        HostListener('click', ['$event']), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [MouseEvent]), 
        __metadata('design:returntype', void 0)
    ], Md2Datepicker.prototype, "_handleClick", null);
    Md2Datepicker = __decorate([
        Component({selector: 'md2-datepicker',
            template: "<div class=\"md2-datepicker-trigger\" (click)=\"toggle()\"> <div class=\"md2-datepicker-icon\"> <svg *ngIf=\"type==='date'\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"> <path d=\"M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z\"></path> </svg> <svg *ngIf=\"type==='time'\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"> <path d=\"M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z\"></path> </svg> <svg *ngIf=\"type==='datetime'\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"> <path d=\"M15,13H16.5V15.82L18.94,17.23L18.19,18.53L15,16.69V13M19,8H5V19H9.67C9.24,18.09 9,17.07 9,16A7,7 0 0,1 16,9C17.07,9 18.09,9.24 19,9.67V8M5,21C3.89,21 3,20.1 3,19V5C3,3.89 3.89,3 5,3H6V1H8V3H16V1H18V3H19A2,2 0 0,1 21,5V11.1C22.24,12.36 23,14.09 23,16A7,7 0 0,1 16,23C14.09,23 12.36,22.24 11.1,21H5M16,11.15A4.85,4.85 0 0,0 11.15,16C11.15,18.68 13.32,20.85 16,20.85A4.85,4.85 0 0,0 20.85,16C20.85,13.32 18.68,11.15 16,11.15Z\"></path> </svg> </div> <div class=\"md2-datepicker-input\"> <span class=\"md2-datepicker-placeholder\" [class.has-value]=\"date\"> {{ placeholder }} </span> <span class=\"md2-datepicker-input-text\">{{_viewValue}}</span> <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"> <path d=\"M7 10l5 5 5-5z\" /> </svg> </div> </div> <template portal> <div class=\"md2-datepicker-panel\" [@fadeInContent]=\"'showing'\" (@fadeInContent.done)=\"_onPanelDone()\" (keydown)=\"_handleKeydown($event)\" [style.transformOrigin]=\"_transformOrigin\" [class.md2-datepicker-panel-done-animating]=\"_panelDoneAnimating\" tabindex=\"0\"> <div class=\"md2-datepicker-header\"> <div class=\"md2-datepicker-header-year\" [class.active]=\"_isYearsVisible\" [class.hidden]=\"type==='time'\" (click)=\"_showYear()\">{{_viewDay.year}}</div> <div class=\"md2-datepicker-header-date-time\"> <span class=\"md2-datepicker-header-date\" [class.active]=\"_isCalendarVisible && !_isYearsVisible\" [class.hidden]=\"type==='time'\" (click)=\"_showCalendar()\"> {{_viewDay.day.substr(0, 3)}}, {{_viewDay.month.substr(0, 3)}}&nbsp;{{_viewDay.date}} </span> <span class=\"md2-datepicker-header-time\" [class.active]=\"!_isCalendarVisible\" [class.hidden]=\"type==='date'\"> <span class=\"md2-datepicker-header-hour\" [class.active]=\"_isHoursVisible\" (click)=\"_toggleHours(true)\">{{_viewDay.hour}}</span>:<span class=\"md2-datepicker-header-minute\" [class.active]=\"!_isHoursVisible\" (click)=\"_toggleHours(false)\">{{_viewDay.minute}}</span> </span> </div> </div> <div class=\"md2-datepicker-content\"> <div class=\"md2-datepicker-calendar\" [class.active]=\"_isCalendarVisible\"> <div class=\"md2-calendar-years\" [class.active]=\"_isYearsVisible\"> <div class=\"md2-calendar-years-content\"> <div *ngFor=\"let y of _years\" class=\"md2-calendar-year\" [class.selected]=\"y === _viewDay.year\" (click)=\"_setYear(y)\">{{y}}</div> </div> </div> <div class=\"md2-calendar-month\" [class.active]=\"!_isYearsVisible\"> <div class=\"md2-calendar-month-header\"> <div class=\"md2-button\" [class.disabled]=\"!_isBeforeMonth()\" (click)=\"_isBeforeMonth() && _updateMonth(-1)\"> <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"> <path d=\"M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z\"></path> </svg> </div> <div class=\"md2-calendar-month-year\">{{_viewDay.month}} {{_viewDay.year}}</div> <div class=\"md2-button\" [class.disabled]=\"!_isAfterMonth()\" (click)=\"_isAfterMonth() && _updateMonth(1)\"> <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"> <path d=\"M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z\"></path> </svg> </div> </div> <table class=\"md2-calendar-dates\"> <thead><tr><th *ngFor=\"let day of _weekDays\">{{day.xshort}}</th></tr></thead> <tbody> <tr *ngFor=\"let w of _dates\"> <td *ngFor=\"let d of w\"> <div class=\"md2-calendar-day\" [class.today]=\"d.today\" [class.focus]=\"_dateUtil.isSameDay(displayDate, d.date)\" [class.selected]=\"_dateUtil.isSameDay(selected, d.date)\" [class.disabled]=\"d.disabled\" [class.prev-month]=\"d.calMonth===_prevMonth\" [class.curr-month]=\"d.calMonth===_currMonth\" [class.next-month]=\"d.calMonth===_nextMonth\" (click)=\"_onClickDate($event,d)\">{{d.dateObj.day}}</div> </td> </tr> </tbody> </table> </div> </div> <div class=\"md2-datepicker-clock\" [class.active]=\"!_isCalendarVisible\"> <!-- (mousedown)=\"_handleMousedown($event)\"--> <div class=\"md2-clock-hand\"> <svg class=\"md2-clock-svg\" width=\"240\" height=\"240\"> <g transform=\"translate(120,120)\"> <line x1=\"0\" y1=\"0\" [attr.x2]=\"_clock.hand.x\" [attr.y2]=\"_clock.hand.y\"></line> <circle class=\"md2-clock-bg\" r=\"17\" [attr.cx]=\"_clock.hand.x\" [attr.cy]=\"_clock.hand.y\"></circle> <circle class=\"md2-clock-fg\" r=\"3.5\" [attr.cx]=\"_clock.hand.x\" [attr.cy]=\"_clock.hand.y\"></circle> <circle class=\"md2-clock-center\" cx=\"0\" cy=\"0\" r=\"2\"></circle> </g> </svg> </div> <div class=\"md2-clock-hours\" [class.active]=\"_isHoursVisible\"> <div *ngFor=\"let h of _hours\" class=\"md2-clock-hour\" [style.top.px]=\"h.top\" [style.left.px]=\"h.left\" (click)=\"_onClickHour($event,h.hour)\">{{h.hour}}</div> </div> <div class=\"md2-clock-minutes\" [class.active]=\"!_isHoursVisible\"> <div *ngFor=\"let m of _minutes\" class=\"md2-clock-minute\" [style.top.px]=\"m.top\" [style.left.px]=\"m.left\" (click)=\"_onClickMinute($event,m.minute)\">{{m.minute}}</div> </div> </div> <div class=\"md2-datepicker-actions\"> <div class=\"md2-button\" (click)=\"close()\">Cancel</div> <div class=\"md2-button\" (click)=\"_onClickOk()\">Ok</div> </div> </div> </div> </template>",
            styles: ["md2-datepicker { position: relative; display: block; max-width: 200px; outline: none; -webkit-backface-visibility: hidden; backface-visibility: hidden; } md2-datepicker.md2-datepicker-disabled { pointer-events: none; cursor: default; } .md2-datepicker-trigger { display: block; padding: 18px 0 18px 32px; white-space: nowrap; cursor: pointer; } .md2-datepicker-icon { position: absolute; top: 21px; left: 0; display: block; height: 24px; width: 24px; vertical-align: middle; fill: currentColor; color: rgba(0, 0, 0, 0.54); } .md2-datepicker-input { position: relative; display: block; min-width: 150px; height: 30px; padding: 2px 26px 1px 2px; margin: 0; line-height: 26px; color: rgba(0, 0, 0, 0.87); vertical-align: middle; box-sizing: border-box; border-bottom: 1px solid rgba(0, 0, 0, 0.12); } .md2-datepicker-input svg { position: absolute; right: 0; top: 2px; fill: currentColor; color: rgba(0, 0, 0, 0.54); } md2-datepicker.ng-invalid.ng-touched:not(.md2-datepicker-disabled) .md2-datepicker-input { color: #f44336; border-bottom: 1px solid #f44336; } .md2-datepicker-disabled .md2-datepicker-input { color: rgba(0, 0, 0, 0.38); border-color: transparent; background-image: linear-gradient(to right, rgba(0, 0, 0, 0.38) 0%, rgba(0, 0, 0, 0.38) 33%, transparent 0%); background-position: bottom -1px left 0; background-size: 4px 1px; background-repeat: repeat-x; } .md2-datepicker-placeholder { position: absolute; right: 26px; bottom: 100%; left: 0; color: rgba(0, 0, 0, 0.38); max-width: 100%; padding-left: 3px; padding-right: 0; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; pointer-events: none; z-index: 1; transform: translate3d(0, 26px, 0) scale(1); transition: transform 400ms cubic-bezier(0.25, 0.8, 0.25, 1); transform-origin: left top; } [aria-required=true] .md2-datepicker-placeholder::after { content: '*'; } .md2-datepicker-placeholder.has-value { transform: translate3d(0, 6px, 0) scale(0.75); } md2-datepicker:focus .md2-datepicker-placeholder { color: #106cc8; transform: translate3d(0, 6px, 0) scale(0.75); } md2-datepicker.md2-datepicker-disabled:focus .md2-datepicker-placeholder { color: rgba(0, 0, 0, 0.38); } .md2-datepicker-input-text { display: block; font-size: 15px; line-height: 26px; } .md2-datepicker-panel { width: 300px; border-radius: 3px; background-color: white; overflow: hidden; box-shadow: 0 11px 15px -7px rgba(0, 0, 0, 0.2), 0 24px 38px 3px rgba(0, 0, 0, 0.14), 0 9px 46px 8px rgba(0, 0, 0, 0.12); outline: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; } .md2-datepicker-header { padding: 16px; color: white; font-weight: 500; white-space: nowrap; background: #106cc8; box-sizing: border-box; } .md2-datepicker-header .hidden { display: none; } .md2-datepicker-header-year { font-size: 16px; opacity: 0.7; cursor: pointer; } .md2-datepicker-header-year.active { opacity: 1; pointer-events: none; } .md2-datepicker-header-date-time { font-size: 32px; } .md2-datepicker-header-date { opacity: 0.7; cursor: pointer; } .md2-datepicker-header-date.active { opacity: 1; pointer-events: none; } .md2-datepicker-header-time { opacity: 0.7; display: inline-block; padding-left: 8px; cursor: pointer; } .md2-datepicker-header-time.active { opacity: 1; cursor: default; } .md2-datepicker-header-time.active .md2-datepicker-header-hour, .md2-datepicker-header-time.active .md2-datepicker-header-minute { opacity: 0.7; cursor: pointer; } .md2-datepicker-header-time.active .md2-datepicker-header-hour.active, .md2-datepicker-header-time.active .md2-datepicker-header-minute.active { opacity: 1; pointer-events: none; } .md2-datepicker-content { position: relative; width: 100%; padding-top: 300px; overflow: hidden; } .md2-datepicker-calendar { position: absolute; top: 0; right: 100%; display: block; width: 100%; height: 300px; transition: 300ms; } .md2-datepicker-calendar.active { right: 0; } .md2-calendar-years { position: absolute; top: 10px; right: 100%; bottom: 10px; display: block; width: 100%; line-height: 40px; background: white; overflow-x: hidden; overflow-y: auto; transition: 300ms; } .md2-calendar-years.active { right: 0; } .md2-calendar-years .md2-calendar-years-content { display: flex; flex-direction: column; justify-content: center; min-height: 100%; } .md2-calendar-year { position: relative; display: block; margin: 0 auto; padding: 0; font-size: 17px; font-weight: 400; text-align: center; cursor: pointer; } .md2-calendar-year.selected { color: #106cc8; font-size: 26px; font-weight: 500; } .md2-calendar-month { position: absolute; left: 100%; display: block; width: 100%; font-size: 12px; font-weight: 400; text-align: center; transition: 300ms; } .md2-calendar-month.active { left: 0; } .md2-calendar-month-header { display: flex; justify-content: space-between; font-size: 14px; font-weight: 700; text-align: center; line-height: 48px; } .md2-calendar-month-header .md2-button { display: inline-block; width: 48px; height: 48px; padding: 12px; outline: none; border: 0; cursor: pointer; background: transparent; box-sizing: border-box; } .md2-calendar-month-header .md2-button svg { vertical-align: top; } .md2-calendar-month-header .md2-calendar-month-year-header { width: 100%; } .md2-calendar-dates { margin: 0 auto; } .md2-calendar-dates th { width: 35px; height: 20px; font-weight: 500; line-height: 15px; opacity: 0.5; } .md2-calendar-dates td { padding: 0; } .md2-calendar-day { position: relative; display: inline-block; width: 35px; height: 35px; border-radius: 50%; text-align: center; cursor: pointer; line-height: 35px; box-sizing: border-box; } .md2-calendar-day.today { color: #106cc8; } .md2-calendar-day:hover, .md2-calendar-day.focus { background: #e0e0e0; } .md2-calendar-day.selected, .md2-calendar-day.selected:hover { color: white; background: #106cc8; } .md2-calendar-day.disabled, .md2-calendar-day.disabled:hover { color: rgba(0, 0, 0, 0.45); background: transparent; pointer-events: none; } .md2-calendar-day.prev-month, .md2-calendar-day.next-month { visibility: hidden; } .md2-datepicker-clock { position: absolute; top: 0; left: 100%; display: block; width: 240px; height: 240px; margin: 30px; font-size: 14px; font-weight: 400; text-align: center; background-color: #e0e0e0; border-radius: 50%; transition: 300ms; } .md2-datepicker-clock.active { left: 0; } .md2-clock-hours, .md2-clock-minutes { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; visibility: hidden; transition: 350ms; transform: scale(1.2); } .md2-clock-hours.active, .md2-clock-minutes.active { opacity: 1; visibility: visible; transform: scale(1); } .md2-clock-minutes { transform: scale(0.8); } .md2-clock-hour, .md2-clock-minute { position: absolute; width: 34px; height: 34px; line-height: 34px; text-align: center; border-radius: 50%; cursor: pointer; } .md2-clock-hour:hover, .md2-clock-minute:hover { background: #65acf3; } .md2-clock-hand { position: absolute; top: 0; left: 0; width: 100%; height: 100%; } .md2-clock-hand line { stroke: #106cc8; stroke-width: 1; stroke-linecap: round; } .md2-clock-bg { fill: #65acf3; } .md2-clock-fg { stroke: none; fill: #106cc8; } .md2-clock-center { stroke: none; fill: #106cc8; } .md2-datepicker-actions { text-align: right; } .md2-datepicker-actions .md2-button { display: inline-block; min-width: 64px; margin: 4px 8px 8px 0; padding: 0 12px; font-size: 14px; color: #106cc8; line-height: 36px; text-align: center; text-transform: uppercase; border-radius: 2px; cursor: pointer; box-sizing: border-box; transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1); } .md2-datepicker-actions .md2-button:hover { background: #ebebeb; } @media (min-width: 480px) { .md2-datepicker-panel { display: flex; width: 450px; } .md2-datepicker-header { width: 150px; min-width: 150px; padding-right: 15px; white-space: normal; word-wrap: break-word; } .md2-datepicker-header-time { display: block; padding-left: 0; } } .cdk-overlay-container, .cdk-global-overlay-wrapper { pointer-events: none; top: 0; left: 0; height: 100%; width: 100%; } .cdk-overlay-container { position: fixed; z-index: 1000; } .cdk-global-overlay-wrapper { display: flex; position: absolute; z-index: 1000; } .cdk-overlay-pane { position: absolute; pointer-events: auto; box-sizing: border-box; z-index: 1000; } .cdk-overlay-backdrop { position: absolute; top: 0; bottom: 0; left: 0; right: 0; z-index: 1000; pointer-events: auto; transition: opacity 400ms cubic-bezier(0.25, 0.8, 0.25, 1); opacity: 0; } .cdk-overlay-backdrop.cdk-overlay-backdrop-showing { opacity: 0.48; } .cdk-overlay-dark-backdrop { background: rgba(0, 0, 0, 0.6); } /*# sourceMappingURL=datepicker.css.map */ "],
            host: {
                'role': 'datepicker',
                '[id]': 'id',
                '[class.md2-datepicker-disabled]': 'disabled',
                '[attr.tabindex]': 'disabled ? -1 : tabindex',
                '[attr.aria-label]': 'placeholder',
                '[attr.aria-required]': 'required.toString()',
                '[attr.aria-disabled]': 'disabled.toString()',
                '[attr.aria-invalid]': '_control?.invalid || "false"',
                '(keydown)': '_handleKeydown($event)',
                '(focus)': '_onFocus()',
                '(blur)': '_onBlur()'
            },
            animations: [
                fadeInContent
            ],
            encapsulation: ViewEncapsulation.None
        }),
        __param(5, Self()),
        __param(5, Optional()), 
        __metadata('design:paramtypes', [ElementRef, Overlay, Renderer, Md2DateUtil, DateLocale, NgControl])
    ], Md2Datepicker);
    return Md2Datepicker;
}());
export var MD2_DATEPICKER_DIRECTIVES = [Md2Datepicker];
export var Md2DatepickerModule = (function () {
    function Md2DatepickerModule() {
    }
    Md2DatepickerModule.forRoot = function () {
        return {
            ngModule: Md2DatepickerModule,
            providers: [Md2DateUtil, DateLocale]
        };
    };
    Md2DatepickerModule = __decorate([
        NgModule({
            imports: [CommonModule, OverlayModule, PortalModule],
            exports: MD2_DATEPICKER_DIRECTIVES,
            declarations: MD2_DATEPICKER_DIRECTIVES,
        }), 
        __metadata('design:paramtypes', [])
    ], Md2DatepickerModule);
    return Md2DatepickerModule;
}());
//# sourceMappingURL=datepicker.js.map