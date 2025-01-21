import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import * as d3 from "d3";

@Component({
  selector: 'form-select',
  templateUrl: './form-select.component.html',
  styleUrl: './form-select.component.less'
})

export class FormSelectComponent implements OnChanges {
  schemes = [
    'schemeSet1',
    'schemeSet2',
    'schemeDark2',
    'schemePaired',
    'schemeTableau10',
  ];
  defaultScheme = this.schemes[1];
  @Input() defaultStyle = '2d';

  @Output() schemeChange = new EventEmitter<string>();
  @Output() styleChange = new EventEmitter<string>();
  @Output() percentageToggle = new EventEmitter<boolean>();
  @Output() pctOptionChange = new EventEmitter<string>();

  selectedScheme = this.defaultScheme;
  selectedStyle = this.defaultStyle;

  ngOnChanges(changes: SimpleChanges): void {
    // console.log(changes);
  }

  onSchemeChange(event: any) {
    this.defaultScheme = event.target.value;
    this.schemeChange.emit(this.defaultScheme);
  }

  onStyleChange(value: string) {
    console.log(value);
    this.selectedStyle = value;
    this.styleChange.emit(this.selectedStyle);
  }
}