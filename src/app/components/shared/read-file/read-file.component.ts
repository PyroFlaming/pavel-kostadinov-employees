import { Component, OnInit, EventEmitter, ViewChild, Output } from '@angular/core';

@Component({
  selector: 'app-read-file',
  templateUrl: './read-file.component.html',
  styleUrls: ['./read-file.component.scss']
})
export class ReadFileComponent implements OnInit {
  @Output()
  public readData: EventEmitter<string> = new EventEmitter();

  @ViewChild('fileInput')
  public fileInput;

  constructor() { }

  ngOnInit(): void {
  }

  public handlerReadFile() {
    const files = Array.prototype.slice.call(this.fileInput.nativeElement.files);

    if (files.length) {
      try {
        const file = files[0];

        const fileReader = new FileReader();

        fileReader.onload = (e) => {
          if (fileReader.result) {
            this.readData.emit(fileReader.result.toString());
          } else {
            this.readData.emit('');
          }
        }

        fileReader.readAsText(file);
      } catch (e) {
        // add popup or error message
        throw new Error('Fail to read file');
      }
    }
  }
}
