import { Component } from '@angular/core';

@Component({
  selector: 'app-resume',
  templateUrl: './resume.component.html',
  styleUrls: ['./resume.component.less']
})
export class ResumeComponent {
  resumePdfPath = 'assets/Eze Ihekwoaba - Senior Software Developer.pdf';

  downloadResume(): void {
    const link = document.createElement('a');
    link.href = this.resumePdfPath;
    link.download = 'Eze_Ihekwoaba_Resume.pdf';
    link.click();
  }
}
