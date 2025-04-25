import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from '../../template/header/header.component';
import { FooterComponent } from '../../template/footer/footer.component';
import { Leagues } from '../../models/leagues.model';
import { Router, RouterLink } from '@angular/router';
import { ToasterService } from '../../services/toaster.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  leagues: Leagues[] = [
    {
      name: 'Liga Verssat',
      img: 'verssat.jpeg',
      private: false,
      organizer: [
        {
          name: 'Felipe',
          phone: '119398349',
          email: 'felipe@icloud.com'
        }
      ]
    },
    { name: 'Copa do Brasil', img: '', private: false, organizer: [{ name: 'JJ' }] },
    { name: 'Brasileirão', img: '', private: false, organizer: [{ name: 'JJ' }] },
  ];

  private router = inject(Router);
  private toaster = inject(ToasterService);
  
  ngOnInit() {
    const msg = localStorage.getItem('mensagem_ativacao');
    if (msg) {
      this.toaster.success(msg);
      localStorage.removeItem('mensagem_ativacao');
    }

  }

  imagemPadrao = 'liga_padrao.png';

  navigateToDetails(leagueName: string) {
    this.router.navigate(['/league-details', leagueName]);
  }
}
