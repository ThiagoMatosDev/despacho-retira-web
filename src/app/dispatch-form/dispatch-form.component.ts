import { Component, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-dispatch-form',
  standalone: true,
  templateUrl: './dispatch-form.component.html',
  imports: [
    FormsModule
  ],
  styleUrls: ['./dispatch-form.component.css']
})
export class DispatchFormComponent {
  @Input() retrieverId: number = 0; // Recebe o ID do retirante
  invoiceNumbers: string = ''; // Números das notas fiscais
  almoxarifeCode: string = ''; // Código do almoxarife

  constructor(private http: HttpClient) {}

  saveDispatch() {
    if (!this.invoiceNumbers || !this.almoxarifeCode) {
      alert('Preencha todos os campos antes de salvar.');
      return;
    }

    const dispatchData = {
      retrieverId: this.retrieverId,
      invoiceNumbers: this.invoiceNumbers.split(',').map(num => num.trim()),
      almoxarifeCode: this.almoxarifeCode,
      dispatchedAt: new Date().toISOString()
    };

    this.http.post('http://localhost:3000/dispatchers', dispatchData).subscribe(() => {
      alert('Despacho salvo com sucesso!');
      this.invoiceNumbers = '';
      this.almoxarifeCode = '';
    });
  }
}
